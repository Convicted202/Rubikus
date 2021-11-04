//
//  ColorProcessor.swift
//  rubikusapp
//
//  Created by Alexander Yanovych on 08.09.2021.
//

import AVKit
import Vision

@objc(ScanBitmapColorPlugin)
public class ScanBitmapColorPlugin: NSObject, FrameProcessorPluginBase {
  private static let context = CIContext(options: nil)
  
  @objc
  public static func callback(_ frame: Frame!, withArgs args: [Any]!) -> Any! {
    let imageBuffer = CMSampleBufferGetImageBuffer(frame.buffer)!
    
    print("CUBE SIZE: \(args[0])")
    
    let cubeSize = args[0] as? Int;
    
    if cubeSize == nil {
      return [
        "colors": [],
        "bounds": []
      ]
    }
    
    let detector = RectangleDetector.init(cubeSize!);
    let request = detector.createVisionRequest(cvPixelBuffer: imageBuffer)
    
    var retColors: [ColorObservationResult] = []
    
    do {
      let observations = request.results
      if observations?.isEmpty == false {
        retColors = detector.processColorsFromObservations(observations as! [VNRectangleObservation], from: imageBuffer)
        
        print("\(retColors.count) COLORS FOUND: ")
        print(retColors)
      }
    } catch _ {
      return nil
    }
    
    if retColors.count == (detector.cubeSize * detector.cubeSize) {
      return [
        "colors": retColors.map({ (o: ColorObservationResult) -> [String: Int] in
          return o.color
        }),
        "bounds": retColors.map({ (o: ColorObservationResult) -> [[Float]] in
          return [o.topLeft, o.topRight, o.bottomLeft, o.bottomRight]
        })
      ]
    } else {
      return [
        "colors": [],
        "bounds": []
      ]
    }
  }
}
