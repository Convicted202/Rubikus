//
//  RNHapticFeedback.m
//  Rubikus
//
//  Created by Alexander Yanovych on 30.10.2021.
//

#import "RNHapticFeedback.h"
#import <UIKit/UIKit.h>

static NSMutableDictionary<NSNumber *, UIImpactFeedbackGenerator *> *impactGeneratorMap = nil;

@implementation RNHapticFeedback
@synthesize bridge = _bridge;

- (void)setBridge:(RCTBridge *)bridge
{
    _bridge = bridge;
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE(HapticFeedback);

RCT_EXPORT_METHOD(notify:(NSString *)type)
{
  if ([type isEqual: @"impactLight"]) {
    [self generateImpactFeedback: UIImpactFeedbackStyleLight];
  } else if ([type isEqual: @"impactMedium"]) {
    [self generateImpactFeedback: UIImpactFeedbackStyleMedium];
  } else if ([type isEqual: @"impactHeavy"]) {
    [self generateImpactFeedback: UIImpactFeedbackStyleHeavy];
  } else if (@available(iOS 13.0, *)) {
    if ([type isEqual: @"rigid"]) {
      [self generateImpactFeedback: UIImpactFeedbackStyleRigid];
    } else if ([type isEqual: @"soft"]) {
      [self generateImpactFeedback: UIImpactFeedbackStyleSoft];
    }
  }
}

-(void)generateImpactFeedback:(UIImpactFeedbackStyle)style
{
  NSNumber *key = [NSNumber numberWithInteger: style];

  if (impactGeneratorMap == nil) {
    impactGeneratorMap = [[NSMutableDictionary alloc] init];
  }
  if ([impactGeneratorMap objectForKey: key] == nil) {
    [impactGeneratorMap setValue: [[UIImpactFeedbackGenerator alloc] initWithStyle: style] forKey: key];
    [[impactGeneratorMap objectForKey: key] prepare];
  }

  UIImpactFeedbackGenerator *generator = [impactGeneratorMap objectForKey: key];
  [generator impactOccurred];
  [generator prepare];
}

@end
