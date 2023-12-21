;(async () => {
  const scriptsWithDataAttribute = document.querySelectorAll('[data-fp-id]')
  const scriptsWithOldAttribute = document.querySelectorAll('[fp_id]')

  const allScripts = Array.from(scriptsWithDataAttribute).concat(
    Array.from(scriptsWithOldAttribute)
  )

  if (!allScripts.length) {
    return // No scripts with data-fp-id or fp_id attribute found
  }

  const scriptUrl = allScripts[0].src
  const arr = scriptUrl.split('/')
  const BACKEND = arr[0] + '//' + arr[2]

  const loadScript = async (name) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')

      script.onload = resolve
      script.src = `${BACKEND}/runtime/${name}.js`
      document.head.appendChild(script)
    })
  }

  await loadScript('3rdparty/iframeResizer.min')

  allScripts.forEach((script, index) => {
    const formID =
      script.getAttribute('data-fp-id') || script.getAttribute('fp_id')
    const token =
      script.getAttribute('data-fp-token') || script.getAttribute('fp_token')
    const widgetTitle =
      script.getAttribute('data-fp-widget-title') ||
      script.getAttribute('fp_widget_title')
    const widgetCookie =
      script.getAttribute('data-fp-widget-cookie') ||
      script.getAttribute('fp_widget_cookie')
    const widget =
      script.getAttribute('data-fp-widget') || script.getAttribute('fp_widget')

    let src = `${BACKEND}/form/view/${formID}?embed=true`

    if (token) {
      src += `&token=${token}`
    }

    const prepopulateParams = Array.from(script.attributes).filter(
      (attribute) => {
        return attribute.name.startsWith('data-fp-prepopulate-')
      }
    )

    // ex: "q_1=answer&q_2=answer"
    const prepopulateParamsString = prepopulateParams
      .map((attribute) => {
        return (
          attribute.name.replace('data-fp-prepopulate-', '') +
          '=' +
          encodeURIComponent(attribute.value)
        )
      })
      .join('&')

    if (prepopulateParamsString.length > 0) {
      src += `&${prepopulateParamsString}`
    }

    const iframeID = 'fp_' + formID

    let iframeElem = `<iframe id="${iframeID}" src="${src}" allow="geolocation *"></iframe>`

    let cookieScript = ''

    let iframeStyle = `
      iframe {
        width: 1px;
        min-width: 100%;
        border: none;
      }
    `

    if (widget !== null) {
      src += `&widget=true`

      const fpTitle = widgetTitle !== null ? `<h3>${widgetTitle}</h3>` : ''

      iframeElem = `
        <div style="position: fixed; bottom: 30px; right: 30px; z-index: 9999;">
          <div class="message-container hidden">
            ${fpTitle}
            <div class="iframe-content">
              <iframe id="${iframeID}" src="${src}" allow="geolocation *"></iframe>
            </div>
          </div>
          <div class="button-container">
            <img src="https://static.formpress.org/images/embed-chat.svg" class="icon chat" onClick="toggleOpen(true)">
            <img src="https://static.formpress.org/images/embed-cross.svg" class="icon cross hidden" onClick="toggleOpen(false)">
          </div>
        </div>
      `

      cookieScript = `
          var loaded${index} = 0
          
          var iframe${index} = document.getElementById('${iframeID}')
          
          if(getCookie('fp_widget_cookie') === "${formID}"){
            iframe${index}.setAttribute('src', "${BACKEND}/form/submit/${formID}")
            iframe${index}.classList.add('fixed-height')
          }
          
          iframe${index}.addEventListener('load', function() {
            loaded${index} += 1
            if(loaded${index} === 2){
              document.cookie = "fp_widget_cookie = ${formID}; max-age = "+ 60*60*24*2;
            }
          });
                
          function getCookie(cname) {
            let name = cname + "=";
            let ca = document.cookie.split(';');
            for(let i = 0; i < ca.length; i++) {
              let c = ca[i];
              while (c.charAt(0) == ' ') {
                c = c.substring(1);
              }
              if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
              }
            }
            return "";
          }
        
        function toggleOpen(open) {
          if (open) {
            document.querySelector('.chat').classList.add('hidden')
            document.querySelector('.cross').classList.remove('hidden')
            document.querySelector('.message-container').classList.remove('hidden')         
          } else {
            document.querySelector('.chat').classList.remove('hidden')
            document.querySelector('.cross').classList.add('hidden')
            document.querySelector('.message-container').classList.add('hidden')
          }
        }       
    `

      // append style for widget
      iframeStyle += `
         .icon {
          cursor: pointer;
          width: 70%;
          position: absolute;
          top: 9px;
          left: 9px;
          transition: transform .3s ease;
        }
        .hidden {
          transform: scale(0);
        }
        .button-container {
          background-color: #8dc340;
          width: 60px;
          height: 60px;
          border-radius: 50%;
        }
        .message-container {
          width: 400px;
          right: -25px;
          bottom: 75px;
          max-height: 400px;
          position: absolute;
          transition: max-height .2s ease;
          font-family: Helvetica, Arial ,sans-serif;
          overflow: scroll;
        }
        .message-container.hidden {
          max-height: 0px;
        }
        .message-container h3 {
          margin: 0;
          padding: 20px 20px;
          color: #fff;
          background-color: #8dc340;
          font-size: 24px;
        }
        .message-container .iframe-content {
          border: 1px solid #dbdbdb;
          display: flex;
          background-color: #fff;
          flex-direction: column;
        }
        .message-container form * {
          margin: 5px 0;
        }
        .message-container form input {
          padding: 10px;
        }
        .message-container form textarea {
          height: 100px;
          padding: 10px;
        }
        .message-container form textarea::placeholder {
          font-family: Helvetica, Arial ,sans-serif;
        }
        .message-container form button {
          cursor: pointer;
          background-color: #04b73f;
          color: #fff;
          border: 0;
          border-radius: 4px;
          padding: 10px;
        }
        .message-container form button:hover {
          background-color: #16632f;
        }   
        .fixed-height {
            height: 400px !important;
        }
      `
    }

    const iframeContainer = document.createElement('div')

    const iframeScript = document.createElement('script')
    iframeScript.innerHTML = cookieScript

    const style = document.createElement('style')
    style.innerHTML = iframeStyle

    iframeContainer.innerHTML = iframeElem
    iframeContainer.appendChild(style)
    iframeContainer.appendChild(iframeScript)

    // add processed attribute to iframe container
    iframeContainer.setAttribute('data-fp_processed', 'true')

    //  prevent script from running again
    if (
      !script.nextElementSibling ||
      !script.nextElementSibling.hasAttribute('data-fp_processed')
    ) {
      script.insertAdjacentElement('afterend', iframeContainer)

      if (window.iFrameResize !== undefined) {
        window.iFrameResize({ log: false }, `#${iframeID}`)
      }
    }
  })
})()
