#import <UIKit/UIKit.h>

#import "AppDelegate.h"

int main(int argc, char * argv[]) {
  struct rlimit rlim;
  unsigned long long NEW_SOFT_LIMIT = 1024;

  //Fetch existing file limits, adjust file limits if possible
  if (getrlimit(RLIMIT_NOFILE, &rlim) == 0) {
    NSLog(@"Current soft RLimit: %llu", rlim.rlim_cur);
    NSLog(@"Current hard RLimit: %llu", rlim.rlim_max);

    // Adjust only if the limit is less than NEW_SOFT_LIMIT
    if(rlim.rlim_cur < NEW_SOFT_LIMIT){
      rlim.rlim_cur = NEW_SOFT_LIMIT;
    }

    if (setrlimit(RLIMIT_NOFILE, &rlim) == -1) {
      NSLog(@"Can't set RLimits");
    }
  } else {
    NSLog(@"Can't fetch RLimits");
  }

  // Re-fetch file limits
  if (getrlimit(RLIMIT_NOFILE, &rlim) == 0) {
    NSLog(@"New soft RLimit: %llu", rlim.rlim_cur);
    NSLog(@"New hard RLimit: %llu", rlim.rlim_max);
  } else {
    NSLog(@"Can't fetch RLimits");
  }
  
  @autoreleasepool {
    return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
  }
}
