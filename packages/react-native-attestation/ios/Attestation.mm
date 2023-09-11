#import "Attestation.h"
#import <DeviceCheck/DeviceCheck.h>
#import <CommonCrypto/CommonCrypto.h>

@implementation Attestation
RCT_EXPORT_MODULE()


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

// See // https://reactnative.dev/docs/native-modules-ios

RCT_EXPORT_METHOD(generateKey:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    DCAppAttestService *attestService = [DCAppAttestService sharedService];
    
    [attestService generateKeyWithCompletionHandler:^(NSString * _Nullable keyId, NSError * _Nullable error) {
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
