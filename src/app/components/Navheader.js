import React from 'react'

function Navheader() {
  return (
    <header className="text-center">
      <h1 className="text-4xl font-extrabold bg-gradient-to-b  from-orange-800 via-orange-700 to-yellow-500 text-transparent bg-clip-text shadow-lg inline-block" style={{filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))' }}>CUYFACE | PREDICT YOUR FACE</h1>
      <p className="text-gray-200">Prediksi foto selfie anda</p>
    </header>
  )
}

export default Navheader
