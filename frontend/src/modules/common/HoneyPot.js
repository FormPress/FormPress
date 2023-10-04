import React from 'react'

const HoneyPot = () => {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .not_today {
            opacity: 0;
            position: absolute;
            top: 0;
            left: 0;
            height: 0;
            width: 0;
            z-index: -1;
          }`
        }}
      />
      <input
        id="h"
        type="text"
        name="email"
        className="not_today"
        tabIndex="-1"
        autoComplete="false"
      />
      <input
        id="o"
        type="text"
        name="website"
        className="not_today"
        tabIndex="-1"
        autoComplete="false"
      />
      <input
        id="n"
        type="text"
        name="phone"
        className="not_today"
        tabIndex="-1"
        autoComplete="false"
      />
      <input
        id="e"
        type="text"
        name="name"
        style={{ display: 'none' }}
        tabIndex="-1"
        autoComplete="false"
      />
      <input
        id="y"
        type="text"
        name="company"
        style={{ display: 'none' }}
        tabIndex="-1"
        autoComplete="false"
      />
    </>
  )
}

export default HoneyPot
