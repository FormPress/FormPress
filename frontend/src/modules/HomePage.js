import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons'
import { faGitlab } from '@fortawesome/free-brands-svg-icons'

import logo_big from '../img/logo_big.png'
import { HomepageRight } from '../svg'

import './HomePage.css'

class HomePage extends Component {
  render() {
    return (
      <div className="homepageContainer">
        <div className="homepage cw center grid">
          <div className="col-4-16">
            <div className="logoContainer">
              <img src={logo_big} alt="FormPress Logo" />
            </div>
            <div className="mainProperties">
              <div className="opensource">
                <FontAwesomeIcon icon={faCheckSquare} />
                Open Source
              </div>
              <div className="lightweight">
                <FontAwesomeIcon icon={faCheckSquare} />
                Light Weight
              </div>
              <div className="fast">
                <FontAwesomeIcon icon={faCheckSquare} />
                Fast
              </div>
            </div>
            <div className="linkToRepo">
              <a
                className="gitlab"
                href="https://gitlab.com/formpress/formpress"
                target="_blank"
                rel="noopener noreferrer">
                <FontAwesomeIcon icon={faGitlab} />
                Go to GitLab page
              </a>
            </div>
          </div>
          <div className="col-12-16 homepageRight">
            <HomepageRight />
          </div>
        </div>
        <div className="footer cw center grid">
          <div className="col-8-16">Copyright © 2020 formpress.org</div>
          <div className="col-8-16 tr">
            <a href="mailto:support@formpress.org">Contact</a>
          </div>
        </div>
      </div>
    )
  }
}

export default HomePage
