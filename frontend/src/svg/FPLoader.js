import * as React from 'react'

const FPLoader = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={57} height={57} {...props}>
    <defs>
      <style>
        {
          '@keyframes animate-svg-fill-1{0%{fill:transparent}to{fill:#113952}}@keyframes animate-svg-fill-2{0%{fill:transparent}to{fill:#8cc63f}}@keyframes animate-svg-fill-3{0%{fill:transparent}to{fill:#113952}}@keyframes animate-svg-fill-4{0%{fill:transparent}to{fill:#0071bc}}#loader,#loader svg{top:50%;left:50%;transform:translate(-50%,-50%)}#loader{height:100vh;width:100%;background-color:#fff;position:fixed;z-index:999}#loader svg{position:absolute;width:8rem;height:8rem}'
        }
      </style>
    </defs>
    <path
      transform="translate(15.673 11.183)"
      style={{
        fill: '#8cc63f',
        animation: 'animate-svg-fill-2 .7s ease .6000000000000001s both'
      }}
      d="M0 0h25.86v8.544H0z"
    />
    <path
      transform="translate(28.528 24.267)"
      style={{
        fill: '#113952',
        animation: 'animate-svg-fill-3 .7s ease 1s both'
      }}
      d="M0 0h13.005v8.62H0z"
    />
    <path
      transform="rotate(-90 30.642 15.175)"
      style={{
        fill: '#0071bc',
        animation: 'animate-svg-fill-4 .7s ease 1.4000000000000001s both'
      }}
      d="M0 0h21.55v8.751H0z"
    />
  </svg>
)

export default FPLoader
