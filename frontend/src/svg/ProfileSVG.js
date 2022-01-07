import React from 'react'

export default function ProfileSVG(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={27} height={27} {...props}>
      <path
        d="M11.25 22.5A11.25 11.25 0 1 1 22.5 11.25 11.263 11.263 0 0 1 11.25 22.5Zm0-10.238c-2.273 0-6.717 1.223-6.75 3.465a8.1 8.1 0 0 0 13.5 0c-.011-.692-.461-1.7-2.548-2.572a12.037 12.037 0 0 0-4.202-.893Zm0-8.887a3.375 3.375 0 1 0 3.375 3.375 3.379 3.379 0 0 0-3.375-3.375Z"
        // transform="translate(17.25 17.25)"
        style={{
          fill: '#1c5c85'
        }}
      />
      <path
        d="M0 0h27v27H0Z"
        style={{
          fill: 'none'
        }}
        // transform="translate(15 15)"
      />
    </svg>
  )
}
