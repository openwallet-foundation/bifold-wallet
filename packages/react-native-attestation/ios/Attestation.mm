#import "Attestation.h"
#import <DeviceCheck/DeviceCheck.h>
#import <CommonCrypto/CommonCrypto.h>
#import <Security/Security.h>

@implementation Attestation
RCT_EXPORT_MODULE()

NSString *KeychainServiceName = @"AriesAttestation";

NSString *keychainIdentifier2() {
    NSString *bundleID = [[NSBundle mainBundle] bundleIdentifier];
    NSString *concatenatedString = [bundleID stringByAppendingString:@".AttestationKey"];
    
    return concatenatedString;
}

NSData *sha256Of(NSString *stringToBeHashed) {
    NSData *data = [stringToBeHashed dataUsingEncoding:NSUTF8StringEncoding];
    uint8_t hash[CC_SHA256_DIGEST_LENGTH];
    CC_SHA256(data.bytes, (CC_LONG)data.length, hash);
    NSData *hashData = [NSData dataWithBytes:hash length:CC_SHA256_DIGEST_LENGTH];

    return hashData;
}

NSArray<NSNumber *> *dataToBytes(NSData *data) {
    const uint8_t *bytes = (const uint8_t *)[data bytes];
    NSMutableArray *array = [NSMutableArray arrayWithCapacity:data.length];
    for (NSUInteger i = 0; i < data.length; i++) {
        [array addObject:@(bytes[i])];
    }
    
    return [array copy];
}

BOOL saveStringToKeychain(NSString *string, NSString *identifier) {
    NSData *stringAsData = [string dataUsingEncoding:NSUTF8StringEncoding];
    
    NSDictionary *attributes = @{
        (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
        (__bridge id)kSecAttrService: KeychainServiceName,
        (__bridge id)kSecAttrAccount: identifier,
        (__bridge id)kSecValueData: stringAsData
    };
    
    OSStatus status = SecItemAdd((__bridge CFDictionaryRef)attributes, NULL);
    
    return status == errSecSuccess;
}

NSString *stringFromKeychainWithIdentifier(NSString *identifier) {

    NSDictionary *query = @{
        (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
        (__bridge id)kSecAttrService: KeychainServiceName,
        (__bridge id)kSecAttrAccount: identifier,
        (__bridge id)kSecReturnData: (__bridge id)kCFBooleanTrue,
        (__bridge id)kSecMatchLimit: (__bridge id)kSecMatchLimitOne
    };
        
    CFTypeRef dataRef = NULL;
    OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query, &dataRef);
    if (status == errSecSuccess) {
        NSData *data = (__bridge_transfer NSData *)dataRef;
        return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    } else {
        return nil;
    }
}

BOOL clearStoredKeyIfExists(NSString *identifier) {
    NSDictionary *query = @{
        (__bridge id)kSecClass: (__bridge id)kSecClassGenericPassword,
        (__bridge id)kSecAttrService: identifier
    };

    // Delete the item from the Keychain.
    OSStatus status = SecItemDelete((__bridge CFDictionaryRef)query);

    if (status == errSecSuccess) {
        NSLog(@"Item deleted successfully.");
        return YES;
    } else if (status == errSecItemNotFound) {
        NSLog(@"Item not found in Keychain.");
        return NO;
    } else {
        NSLog(@"Error deleting item from Keychain. Status code: %d", (int)status);
        return NO;
    }
}

NSError *errorWithReason(NSString *reason, NSInteger code) {
    NSString *domain = [[NSBundle mainBundle] bundleIdentifier];
    NSDictionary *userInfo = @{
        NSLocalizedDescriptionKey: @"An error occurred.",
        NSLocalizedFailureReasonErrorKey: reason,
    };
    
    return [NSError errorWithDomain:domain code:code userInfo:userInfo];
}

NSString *messageAttestationErrorCode(NSInteger code) {
    NSString *result;
    
    // See https://developer.apple.com/documentation/devicecheck/dcerror
    // for a full list and description of errors.
    switch (code) {
        case 2: // DCErrorInvalidInput
            // This may occur if the key is no longer valid or other
            // unexpected input is provided.
            result = @"The provided input is not formatted correctly.";
            break;
        case 3:
            result = @"The provided key ID is invalid or the key is not found.";
            break;
        case 4:
            result = @"The device is not eligible for App Attestation.";
            break;
        default:
            result = @"Unable to generate attestation object.";
            break;
    }
    
    return result;
}

DCAppAttestService *sharedService() {
    NSString *version = [[UIDevice currentDevice] systemVersion];
    if ([version compare:@"14.0" options:NSNumericSearch] != NSOrderedDescending) {
        NSLog(@"iOS version is less than 14.0");
        return nil;
    }
    
    DCAppAttestService *service = [DCAppAttestService sharedService];
    if (service.isSupported) {
        return service;
    }
    
    return nil;
}

// See // https://reactnative.dev/docs/native-modules-ios

RCT_EXPORT_METHOD(generateKey:(BOOL)cache
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSString *keyId = nil;
    
    DCAppAttestService *attestService = sharedService();
    if (attestService == nil) {
        NSString *message = @"The device is not eligible for App Attestation.";
        reject(@"error", message, errorWithReason(message, 22));

        return;
    }
    
    NSString *keychainIdentifier = keychainIdentifier2();

    if (cache) {
        keyId = stringFromKeychainWithIdentifier(keychainIdentifier);
    } else {
        clearStoredKeyIfExists(keychainIdentifier);
    }

    if (keyId != nil) {
        NSLog(@"returning existing key...");
        resolve(keyId);
        
        return;
    }
    
    [attestService generateKeyWithCompletionHandler:^(NSString * _Nullable keyId, NSError * _Nullable error) {
        if (error) {
            NSLog(@"generateKeyWithCompletionHandler error %@", error);
            reject(@"error", @"Unable to generate key.", errorWithReason(@"Unable to generate key.", 21));
            
            return;
        }
        
        NSLog(@"saving key to KC = %@", keyId);

        if (cache) {
            saveStringToKeychain(keyId, keychainIdentifier);
        }
        
        resolve(keyId);
    }];
}

RCT_EXPORT_METHOD(sha256:(NSString *)stringToBeHashed
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSArray<NSNumber *> *result = [dataToBytes(sha256Of(stringToBeHashed)) copy];

    resolve(result);
}

RCT_EXPORT_METHOD(appleKeyAttestation:(NSString *)keyId
                  challenge:(NSString *)challenge
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSInteger InvalidKeyErrorCode = 3;
    DCAppAttestService *attestService = sharedService();
    if (attestService == nil) {
        NSString *message = @"The device is not eligible for App Attestation.";
        reject(@"error", message, errorWithReason(message, 22));
        
        return;
    }

    NSData *hashData = sha256Of(challenge);

    [attestService attestKey:keyId clientDataHash:hashData completionHandler:^(NSData * _Nullable attestationObject, NSError * _Nullable error) {

        if (error) {
            NSLog(@"attestKey error %@", error);
            NSString *message = messageAttestationErrorCode(error.code);
            
            if (error.code == InvalidKeyErrorCode) {
                NSString *keychainIdentifier = keychainIdentifier2();
                clearStoredKeyIfExists(keychainIdentifier);
            }
            
            reject(@"error", message, errorWithReason(message, error.code));
        } else {
            NSArray<NSNumber *> *result = dataToBytes(attestationObject);
            resolve(result);
        }
    }];
}

RCT_EXPORT_METHOD(appleAttestation:(NSString *)keyId
                  challenge:(NSString *)challenge
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSInteger InvalidKeyErrorCode = 3;
    DCAppAttestService *attestService = sharedService();
    if (attestService == nil) {
        NSString *message = @"The device is not eligible for App Attestation.";
        reject(@"error", message, errorWithReason(message, 22));
        
        return;
    }

    NSData *hashData = sha256Of(challenge);

    [attestService attestKey:keyId clientDataHash:hashData completionHandler:^(NSData * _Nullable attestationObject, NSError * _Nullable error) {

        if (error) {
            NSLog(@"appleAttestationAsBase64 error %@", error);
            NSString *message = messageAttestationErrorCode(error.code);
            
            if (error.code == InvalidKeyErrorCode) {
                NSString *keychainIdentifier = keychainIdentifier2();
                clearStoredKeyIfExists(keychainIdentifier);
            }
            
            reject(@"error", message, errorWithReason(message, error.code));
        } else {
            NSArray<NSNumber *> *result = dataToBytes(attestationObject);
            resolve(result);
        }
    }];
}

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeAttestationSpecJSI>(params);
}
#endif

@end
