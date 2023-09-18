#import "Attestation.h"
#import <DeviceCheck/DeviceCheck.h>
#import <CommonCrypto/CommonCrypto.h>
#import <Security/Security.h>

@implementation Attestation
RCT_EXPORT_MODULE()

NSMutableDictionary *queryForKeychain(NSString *identifier) {
    NSMutableDictionary *query = [NSMutableDictionary dictionary];
    [query setObject:(__bridge id)kSecClassGenericPassword forKey:(__bridge id)kSecClass];
    [query setObject:identifier forKey:(__bridge id)kSecAttrAccount];
    
    return query;
}

NSString *keychainIdentifier2() {
    NSString *bundleID = [[NSBundle mainBundle] bundleIdentifier];
    NSString *concatenatedString = [bundleID stringByAppendingString:@".AttestationKey"];
    
    return concatenatedString;
}

NSArray<NSNumber *> *sha256Of(NSString *stringToBeHashed) {
    NSData *data = [stringToBeHashed dataUsingEncoding:NSUTF8StringEncoding];
    uint8_t hash[CC_SHA256_DIGEST_LENGTH];
    CC_SHA256(data.bytes, (CC_LONG)data.length, hash);
    NSMutableArray *array = [NSMutableArray arrayWithCapacity:CC_SHA256_DIGEST_LENGTH];
    for (NSUInteger i = 0; i < CC_SHA256_DIGEST_LENGTH; i++) {
        [array addObject:@(hash[i])];
    }
    
    return [array copy];
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
    NSData *stringData = [string dataUsingEncoding:NSUTF8StringEncoding];
    
    NSMutableDictionary *query = queryForKeychain(identifier);
    [query setObject:stringData forKey:(__bridge id)kSecValueData];
    [query setObject:(__bridge id)kSecAttrAccessibleWhenUnlocked forKey:(__bridge id)kSecAttrAccessible];
    
    OSStatus status = SecItemAdd((__bridge CFDictionaryRef)query, NULL);
    
    return status == errSecSuccess;
}

NSString *getStringFromKeychainWithIdentifier(NSString *identifier) {

    NSMutableDictionary *query = queryForKeychain(identifier);
    [query setObject:(__bridge id)kCFBooleanTrue forKey:(__bridge id)kSecReturnData];
    [query setObject:(__bridge id)kSecMatchLimitOne forKey:(__bridge id)kSecMatchLimit];
    
    CFTypeRef dataRef = NULL;
    OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)query, &dataRef);
    if (status == errSecSuccess) {
        NSData *data = (__bridge_transfer NSData *)dataRef;
        return [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    } else {
        return nil;
    }
}


// See // https://reactnative.dev/docs/native-modules-ios

RCT_EXPORT_METHOD(generateKey:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSLog(@"**************************** XXXX **********************************");

    DCAppAttestService *attestService = [DCAppAttestService sharedService];
    
    NSString *keychainIdentifier = keychainIdentifier2();
    NSString *keyId = getStringFromKeychainWithIdentifier(keychainIdentifier);
    NSLog(@"found key %@", keyId);

    if (keyId != nil) {
        NSLog(@"returning existing key...");
        resolve(keyId);
        
        return;
    }
    
    [attestService generateKeyWithCompletionHandler:^(NSString * _Nullable keyId, NSError * _Nullable error) {
        if (error) {
            NSLog(@"generateKeyWithCompletionHandler error %@", error);
            reject(@"error", @"error", error);
        }
        
        NSLog(@"saving key to KC = ", keyId);

        saveStringToKeychain(keyId, keychainIdentifier);
        
        resolve(keyId);
    }];
}

RCT_EXPORT_METHOD(sha256:(NSString *)stringToBeHashed
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSArray<NSNumber *> *result = sha256Of(stringToBeHashed);

    resolve(result);
}

RCT_EXPORT_METHOD(appleAttestationAsBase64:(NSString *)keyId
                  challenge:(NSString *)challenge
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSData *data = [challenge dataUsingEncoding:NSUTF8StringEncoding];
    uint8_t hash[CC_SHA256_DIGEST_LENGTH];
    CC_SHA256(data.bytes, (CC_LONG)data.length, hash);
    NSData *hashData = [NSData dataWithBytes:hash length:CC_SHA256_DIGEST_LENGTH];
    
    DCAppAttestService *attestService = [DCAppAttestService sharedService];
    
    [attestService attestKey:keyId clientDataHash:hashData completionHandler:^(NSData * _Nullable attestationObject, NSError * _Nullable error) {

        if (error) {
            NSLog(@"appleAttestationAsBase64 error %@", error);
            reject(@"error", @"error", error);
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
