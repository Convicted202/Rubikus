//
//  RectangleDetector.swift
//  rubikusapp
//
//  Created by Alexander Yanovych on 13.09.2021.
//

import Foundation
import Vision
import AVKit

class ColorObservationResult {
  var color: [String: Int];
  
  var topLeft: [Float],
      topRight: [Float],
      bottomLeft: [Float],
      bottomRight: [Float];
  
  init(_ color: [String: Int], topLeft: CGPoint, topRight: CGPoint, bottomLeft: CGPoint, bottomRight: CGPoint) {
    self.color = color;
    self.topLeft = [Float(topLeft.x), Float(topLeft.y)];
    self.topRight = [Float(topRight.x), Float(topRight.y)];
    self.bottomLeft = [Float(bottomLeft.x), Float(bottomLeft.y)]
    self.bottomRight = [Float(bottomRight.x), Float(bottomRight.y)];
  }
}

class RectangleDetector {
  let maximumObservations = 0;
  let minimumAspectRatio: VNAspectRatio = 0.3;
  let maximumAspectRatio: VNAspectRatio = 1.0;
  let minimumSize: Float = 0.1;
  let quadratureTolerance: VNDegrees = 15.0;
  let minimumConfidence: VNConfidence = 0.5;
  
  var cubeSize = 3;
  
  init(_ size: Int) {
    self.cubeSize = size;
  }
  
  static func withCapturedTime<A> (f: @autoclosure () -> A) -> A {
    let startTime = CFAbsoluteTimeGetCurrent()
    let result = f()
    let endTime = CFAbsoluteTimeGetCurrent()
    print("\(#function): Took \(endTime - startTime) seconds.")
    return result
  }
  
  func createVisionRequest(cvPixelBuffer pixelBuffer: CVImageBuffer) -> VNImageBasedRequest {
    let requestHandler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer)
    let request = VNDetectRectanglesRequest()
    
    request.maximumObservations = maximumObservations
    request.minimumAspectRatio = minimumAspectRatio
    request.maximumAspectRatio = maximumAspectRatio
    request.minimumSize = minimumSize
    request.quadratureTolerance = quadratureTolerance
    request.minimumConfidence = minimumConfidence
    
    request.usesCPUOnly = false
    
    do {
      try requestHandler.perform([request])
    } catch {
      print("Error: Rectangle detection failed - vision request failed.")
    }
    
    return request;
  }
  
  func processColorsFromObservations(_ observations: [VNRectangleObservation], from buffer: CVImageBuffer) -> [ColorObservationResult] {
    // first convert bounds from normalized coordinates to screen coordinates
    let uiObservations = self
      .convertObservationsToScreen(observations, from: buffer)
    
    // filter artifacts out
    let filteredObservations = self
      .filterObservations(uiObservations, from: buffer)
    
    return filteredObservations
      .map({ (o: VNREctangleObservationConverted) in
        let color = self.getAverageColor(from: buffer, observation: o.observation)
        
        return ColorObservationResult(
          color!,
          topLeft: o.topLeft,
          topRight: o.topRight,
          bottomLeft: o.bottomLeft,
          bottomRight: o.bottomRight
        )
      })
  }
  
  func convertObservationsToScreen(_ observations: [VNRectangleObservation], from buffer: CVImageBuffer) -> [VNREctangleObservationConverted] {
    let bufferWidth = CVPixelBufferGetWidth(buffer);
    let bufferHeight = CVPixelBufferGetWidth(buffer);
    
    return observations.map({ observation in
      return VNREctangleObservationConverted(observation: observation, bounds: CGSize(width: bufferWidth, height: bufferHeight))
    })
  }
  
  func filterObservations(_ observations: [VNREctangleObservationConverted], from buffer: CVImageBuffer) -> [VNREctangleObservationConverted] {
    let bufferWidth = CVPixelBufferGetWidth(buffer);
    let bufferHeight = CVPixelBufferGetWidth(buffer);
    
    let bufferSize = min(bufferWidth, bufferHeight)
    
    var o = observations
    
    o = o.filterOversized(upperLimit: CGFloat(bufferSize / self.cubeSize))
    
    o = o.filterUndersized(bottomLimit: o.medianSize / 1.3)
    
    o = o.filterOversized(upperLimit: o.medianSize * 1.3)
    
    o = o.filterOutParents()
    
    //    print("OBSERVATIONS FOUND: \(o.count)")
    
    o = o.filterRogues(self.cubeSize)
    
    if o.count == self.cubeSize * self.cubeSize {
      o = o.sortByGrid(size: self.cubeSize)
    }
    
    return o as [VNREctangleObservationConverted];
  }
  
  func getAverageColor(from buffer: CVImageBuffer, observation: VNRectangleObservation) -> [String: Int]? {
    var ciImage = CIImage(cvImageBuffer: buffer)
    ciImage = self.doResize(source: ciImage)
    
    let size = ciImage.extent.size
    
    let topLeft = observation.topLeft.scale(to: size)
    let topRight = observation.topRight.scale(to: size)
    let bottomLeft = observation.bottomLeft.scale(to: size)
    let bottomRight = observation.bottomRight.scale(to: size)
    
    // pass those to the filter to extract/rectify the image
    ciImage = ciImage.applyingFilter("CIPerspectiveCorrection", parameters: [
      "inputTopLeft": CIVector(cgPoint: topLeft),
      "inputTopRight": CIVector(cgPoint: topRight),
      "inputBottomLeft": CIVector(cgPoint: bottomLeft),
      "inputBottomRight": CIVector(cgPoint: bottomRight),
    ])
    
    let context = CIContext()
    let cgImage = context.createCGImage(ciImage, from: ciImage.extent)
    
    let img = UIImage(cgImage: cgImage!)
    
    print("SEARCHING COLORS ON: \(img.size)")
    
    return img.findAverageColor()
  }
  
  func pickColor(from buffer: CVImageBuffer, toRect cropRect: CGRect, insetAmount: Int) -> [String: Int]? {
    let ciImage = CIImage(cvImageBuffer: buffer)
    let context = CIContext()
    let cgImage = context.createCGImage(ciImage, from: ciImage.extent)
    
    //    let cropZone = cropRect.insetBy(dx: CGFloat(insetAmount), dy: CGFloat(insetAmount))
    
    // Perform cropping in Core Graphics
    guard let cutImageRef: CGImage = cgImage?.cropping(to: cropRect)
    else {
      return nil
    }
    
    // Return image to UIImage
    let croppedImage: UIImage = UIImage(cgImage: cutImageRef)
    return croppedImage.findAverageColor()
  }
  
  func doResize(source: CIImage) -> CIImage {
    let resizeFilter = CIFilter(name: "CILanczosScaleTransform")!
    
    // Desired output size. Arbitrary
    let targetSize = CGSize(width: 190, height: 230)
    
    // Compute scale and corrective aspect ratio
    let scale = targetSize.height / (source.extent.height)
    let aspectRatio = targetSize.width/((source.extent.width) * scale)
    
    // Apply resizing
    resizeFilter.setValue(source, forKey: kCIInputImageKey)
    resizeFilter.setValue(scale, forKey: kCIInputScaleKey)
    resizeFilter.setValue(aspectRatio, forKey: kCIInputAspectRatioKey)
    return resizeFilter.outputImage!
  }
}
