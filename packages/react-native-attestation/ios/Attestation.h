
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNAttestationSpec.h"

@interface Attestation : NSObject <NativeAttestationSpec>
#else
#import <React/RCTBridgeModule.h>

@interface Attestation : NSObject <RCTBridgeModule>
#endif

@end
