import React from 'react'

export default function ProfileSVG(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={57}
      height={57}
      viewBox="0 0 57 57"
      {...props}>
      <defs>
        <style
          dangerouslySetInnerHTML={{
            __html:
              '.profileSVG .a{fill:#e2e2e2;opacity:0;}.profileSVG .b{fill:#1c5c85;}.profileSVG .c{fill:none;}'
          }}
        />
      </defs>
      <g transform="translate(-1425 -18)" className="profileSVG">
        <rect
          className="a"
          width={57}
          height={57}
          transform="translate(1425 18)"
        />
        <g transform="translate(1753 -772)">
          <g transform="translate(-313 805)">
            <path
              className="b"
              d="M11.25,22.5A11.25,11.25,0,1,1,22.5,11.25,11.263,11.263,0,0,1,11.25,22.5Zm0-10.238c-2.273,0-6.717,1.223-6.75,3.465a8.1,8.1,0,0,0,13.5,0c-.011-.692-.461-1.7-2.548-2.572A12.037,12.037,0,0,0,11.25,12.262Zm0-8.887A3.375,3.375,0,1,0,14.625,6.75,3.379,3.379,0,0,0,11.25,3.375Z"
              transform="translate(2.25 2.25)"
            />
            <path className="c" d="M0,0H27V27H0Z" />
          </g>
        </g>
      </g>
    </svg>
  )
}
