import React from 'react';

export default function Logo(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={57} height={57} viewBox="0 0 57 57" {...props}>
      <defs>
        <style dangerouslySetInnerHTML={{__html: ".a,.c{fill:#113952;}.a{opacity:0;}.b{fill:#8cc63f;}.d{fill:#0071bc;}" }} />
      </defs>
      <rect className="a" width={57} height={57} />
      <rect className="b" width="25.86" height="8.544" transform="translate(15.673 11.183)" />
      <rect className="c" width="13.005" height="8.62" transform="translate(28.528 24.267)" />
      <rect className="d" width="21.55" height="8.751" transform="translate(15.467 45.817) rotate(-90)" />
    </svg>
  );
}
