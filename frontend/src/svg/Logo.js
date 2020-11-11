import React from 'react'

export default function Logo(props) {
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
              '.logoa,.logoc{fill:#113952;}.logoa{opacity:0;}.logob{fill:#8cc63f;}.logod{fill:#0071bc;}'
          }}
        />
      </defs>
      <rect className="logoa" width={57} height={57} />
      <rect
        className="logob"
        width="25.86"
        height="8.544"
        transform="translate(15.673 11.183)"
      />
      <rect
        className="logoc"
        width="13.005"
        height="8.62"
        transform="translate(28.528 24.267)"
      />
      <rect
        className="logod"
        width="21.55"
        height="8.751"
        transform="translate(15.467 45.817) rotate(-90)"
      />
    </svg>
  )
}
