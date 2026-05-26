#!/usr/bin/env node
// Script to generate PWA icons
const { createCanvas } = require('canvas')
const fs = require('fs')
const path = require('path')

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0a0f0d'
  ctx.roundRect(0, 0, size, size, size * 0.22)
  ctx.fill()

  // Outer ring
  ctx.strokeStyle = '#10b981'
  ctx.lineWidth = size * 0.05
  ctx.beginPath()
  ctx.arc(size/2, size/2, size * 0.35, 0, Math.PI * 2)
  ctx.stroke()

  // Dollar sign
  ctx.fillStyle = '#10b981'
  ctx.font = `bold ${size * 0.4}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('₹', size/2, size/2)

  const buffer = canvas.toBuffer('image/png')
  fs.writeFileSync(outputPath, buffer)
  console.log(`Generated ${outputPath}`)
}

try {
  generateIcon(192, path.join(__dirname, '../public/icons/icon-192.png'))
  generateIcon(512, path.join(__dirname, '../public/icons/icon-512.png'))
} catch (e) {
  console.log('Canvas not available, creating SVG fallback icons')
  // SVG fallback
  const svgIcon = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size*0.22}" fill="#0a0f0d"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="none" stroke="#10b981" stroke-width="${size*0.05}"/>
  <text x="${size/2}" y="${size/2}" text-anchor="middle" dominant-baseline="middle" fill="#10b981" font-size="${size*0.4}" font-family="sans-serif" font-weight="bold">₹</text>
</svg>`
  fs.writeFileSync(path.join(__dirname, '../public/icons/icon-192.svg'), svgIcon(192))
  fs.writeFileSync(path.join(__dirname, '../public/icons/icon-512.svg'), svgIcon(512))
}
