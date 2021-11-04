//
//  VNRectangleObservation+perimeter.swift
//  rubikusapp
//
//  Created by Alexander Yanovych on 14.09.2021.
//

import Foundation
import Vision

class VNREctangleObservationConverted: CustomStringConvertible, Equatable {
  var observation: VNRectangleObservation;
  var topLeft: CGPoint;
  var topRight: CGPoint;
  var bottomLeft: CGPoint;
  var bottomRight: CGPoint;
  var boundingBox: CGRect;
  
  var rank: Int? = nil;
  var color: Dictionary<String, Int>? = nil;
  
  var description: String { return "{ \(self.topLeft), \(self.bottomRight.x - self.topLeft.x), \(self.bottomRight.y - self.topLeft.y) }" }
  
  init(observation: VNRectangleObservation, bounds: CGSize) {
    self.observation = observation;
    
    let transform = CGAffineTransform.identity
      .scaledBy(x: 1, y: -1)
      .translatedBy(x: 0, y: -bounds.height)
      .scaledBy(x: bounds.width, y: bounds.height)
    
    let frame = observation.boundingBox.applying(transform)
    
    self.topLeft = CGPoint(x: frame.minX, y: frame.minY)
    self.topRight = CGPoint(x: frame.maxX, y: frame.minY)
    self.bottomLeft = CGPoint(x: frame.minX, y: frame.maxY)
    self.bottomRight = CGPoint(x: frame.maxX, y: frame.maxY)
    self.boundingBox = CGRect(x: frame.minX, y: frame.minY, width: frame.maxX - frame.minX, height: frame.maxY - frame.minY)
  }
  
  var biggestSide: CGFloat {
    return max(
      self.topLeft.distance(to: self.topRight),
      self.topRight.distance(to: self.bottomRight),
      self.bottomRight.distance(to: self.bottomLeft),
      self.bottomLeft.distance(to: self.topLeft)
    )
  }
  
  var perimeter: CGFloat {
    return (
      self.topLeft.distance(to: self.topRight) +
        self.topRight.distance(to: self.bottomRight) +
        self.bottomRight.distance(to: self.bottomLeft) +
        self.bottomLeft.distance(to: self.topLeft)
    )
  }
  
  var approxArea: CGFloat {
    return self.boundingBox.height * self.boundingBox.width
  }
  
  public static func == (lhs: VNREctangleObservationConverted, rhs: VNREctangleObservationConverted) -> Bool {
    return lhs.observation == rhs.observation
  }
}


extension Array where Element == VNREctangleObservationConverted {
  var medianArea: CGFloat {
    let areasTotal = self.map({ $0.approxArea }).reduce(0, +)
    
    return areasTotal / CGFloat(self.count);
  }
  
  var medianSize: CGFloat {
    let areasTotal = self.map({ $0.biggestSide }).reduce(0, +)
    
    return areasTotal / CGFloat(self.count);
  }
  
  func filterOversized(upperLimit: CGFloat) -> [VNREctangleObservationConverted] {
    return self.filter({ $0.biggestSide < upperLimit })
  }
  
  func filterUndersized(bottomLimit: CGFloat) -> [VNREctangleObservationConverted] {
    return self.filter({ $0.biggestSide > bottomLimit })
  }
  
  func filterOutParents() -> [VNREctangleObservationConverted] {
    return self.filter({ (candidate: VNREctangleObservationConverted) in
      let isParent: Bool = self.contains(where: { (o: VNREctangleObservationConverted) in
        return (candidate != o) && candidate.boundingBox.contains(o.boundingBox)
      })
      
      return isParent == false
    })
  }
  
  func filterRogues(_ axisCount: Int) -> [VNREctangleObservationConverted] {
    return self.filter({ (candidate: VNREctangleObservationConverted) in
      let (horzCount, vertCount) = self.getNeighboringInformation(candidate: candidate)
      
      if (horzCount < axisCount - 1) || (vertCount < axisCount - 1) {
        return false
      }
      
      return true
    })
  }
  
  private func hasChildRectangles(candidate: VNREctangleObservationConverted) -> Bool {
    return self.contains(where: { (o: VNREctangleObservationConverted) in
      return (candidate != o) && candidate.boundingBox.contains(o.boundingBox)
    })
  }
  
  private func getNeighboringInformation(candidate: VNREctangleObservationConverted) -> (Int, Int) {
    let widthThresh = self.medianSize * 0.6
    let heightThresh = self.medianSize * 0.6
    
    print("Neighboring Thresholds: \(widthThresh) \(heightThresh)")
    
    var horzCount = 0
    var vertCount = 0
    
    for observation in self {
      if observation == candidate {
        continue
      }
      
      let xDiff = abs(observation.boundingBox.midX - candidate.boundingBox.midX)
      let yDiff = abs(observation.boundingBox.midY - candidate.boundingBox.midY)
      
      print("Neighboring Thresholds mediaan Center Point Diffs: \(xDiff) \(yDiff)")
      
      if xDiff < widthThresh {
        vertCount += 1
      }
      
      if yDiff < heightThresh {
        horzCount += 1
      }
    }
    
    return (horzCount, vertCount)
  }
  
  private func getGlobalBounds() -> CGRect {
    let initial = (minX: Int.max, minY: Int.max, maxX: 0, maxY: 0)
    
    let rectValues = self.reduce(initial, { res, curr in
      return (
        minX: Swift.min(res.minX, Int(curr.boundingBox.minX)),
        minY: Swift.min(res.minY, Int(curr.boundingBox.minY)),
        maxX: Swift.max(res.maxX, Int(curr.boundingBox.maxX)),
        maxY: Swift.max(res.maxY, Int(curr.boundingBox.maxY))
      )
    })
    
    let (minX, minY, maxX, maxY) = rectValues
    
    return CGRect(x: minX, y: minY, width: maxX - minX, height: maxY - minY)
  }
  
  func sortByGrid(size: Int) -> [VNREctangleObservationConverted] {
    let bounds = self.getGlobalBounds()
    
    let cellWidth = bounds.width / CGFloat(size)
    let cellHeight = bounds.height / CGFloat(size)
    
    // calculate rank (index) in grid and sort by rank
    return self.map({ (o: VNREctangleObservationConverted) -> VNREctangleObservationConverted in
      let colIdx = Int(abs(o.boundingBox.midX - bounds.minX) / cellWidth)
      let rowIdx = Int(abs(o.boundingBox.midY - bounds.minY) / cellHeight)
      
      o.rank = colIdx + size * rowIdx
      
      return o
    }).sorted(by: { o1, o2 in
      return o1.rank! < o2.rank!
    })
  }
}
