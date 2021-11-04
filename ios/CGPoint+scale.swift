//
//  CGPoint+scale.swift
//  rubikusapp
//
//  Created by Alexander Yanovych on 13.09.2021.
//

import Foundation

extension CGPoint {
  func scale(to size: CGSize) -> CGPoint {
    return CGPoint(
      x: self.x * size.width,
      y: self.y * size.height
    )
  }
  
  func distance(to point: CGPoint) -> CGFloat {
    return sqrt(pow(point.x - self.x, 2) + pow(point.y - self.y, 2))
  }
}
