import React, { useState } from 'react'
import './Pricing.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

const Pricing = (props) => {
  let { user_role } = props.generalContext.auth
  const [period, setPeriod] = useState('pricing-yearly')

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3"
        crossOrigin="anonymous"
      />
      <div className={`pricing-container ${period} BlackFriday`}>
        <div className="container">
          <div className="black-friday-banner">
            <img
              alt=""
              className="img-fluid"
              src="https://static.formpress.org/images/black-friday-pricing.png"
            />
            <h3 className="black-friday-banner-title">
              %56 Discount On Yearly Plans!
            </h3>
          </div>
          <div className="black-friday-advantages">
            <img
              alt=""
              className="img-fluid"
              src="https://static.formpress.org/images/arranged-discount.png"
            />
            <img
              alt=""
              className="img-fluid"
              src="https://static.formpress.org/images/money-back.png"
            />
            <img
              alt=""
              className="img-fluid"
              src="https://static.formpress.org/images/cancel-anytime.png"
            />
            <img
              alt=""
              className="img-fluid"
              src="https://static.formpress.org/images/24-7-support.png"
            />
          </div>
          <h2 className="text-center mb-4 pricing-title">PRICING</h2>
          <div className="black-friday-toggle-area">
            Monthly
            <label className="switch">
              <input
                id="pricing-period"
                type="checkbox"
                checked={period === 'pricing-yearly' ? true : false}
                onClick={() =>
                  period === 'pricing-monthly'
                    ? setPeriod('pricing-yearly')
                    : setPeriod('pricing-monthly')
                }
              />
              <span className="slider round"></span>
            </label>
            Yearly
          </div>
          <div className="pricing-table g-5 py-5 ">
            <div className="row align-items-baseline justify-content-center">
              <div className="col-md-2 col-sm-6 pricing-features">
                <table className="table table-striped table-borderless">
                  <thead>
                    <tr>
                      <th className="formpress_features_title">
                        FORMPRESS FEATURES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>FORMS</td>
                    </tr>
                    <tr>
                      <td>QUESTIONS PER FORM</td>
                    </tr>
                    <tr>
                      <td>SUBMISSIONS PER MONTH</td>
                    </tr>
                    <tr>
                      <td>TECH SUPPORT</td>
                    </tr>
                    <tr>
                      <td>FILE UPLOADS</td>
                    </tr>
                    <tr>
                      <td>NET PROMOTER SCORE</td>
                    </tr>
                    <tr>
                      <td>ACCESS TO OUR SLACK CHANNEL</td>
                    </tr>
                    <tr>
                      <td>SCHEDULED PRIVATE SUPPORT</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="col-md-2 col-sm-6 free-plan-container">
                <table className="table table-striped table-hover table-borderless free-plan">
                  <thead>
                    <tr>
                      <th scope="col" className="text-black">
                        BASIC
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="mobile-features">FORMS: </span>5
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          QUESTIONS PER FORM:{' '}
                        </span>
                        10
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          SUBMISSIONS PER MONTH:{' '}
                        </span>
                        100
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">TECH SUPPORT: </span>
                        TEXT{' '}
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="information-mark"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Email and ticket based support"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">FILE UPLOADS: </span>
                        100MB
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          NET PROMOTER SCORE:{' '}
                        </span>
                        <div className="available-checkmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          ACCESS TO OUR SLACK CHANNEL:{' '}
                        </span>
                        <div className="unavailable-xmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          SCHEDULED PRIVATE SUPPORT:{' '}
                        </span>
                        <div className="unavailable-xmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td className="free-contact">
                        <div className="text-decoration-none">
                          <div className="free-support">FREE</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {user_role === 2 ? (
                  <div className="text-decoration-none text-center purchase-link">
                    <div className="purchase-button current-plan">
                      Current Plan
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="col-md-2 col-sm-6 silver-plan-container">
                <table className="table table-striped table-hover table-borderless silver-plan">
                  <thead>
                    <tr>
                      <th scope="col" className="text-white">
                        SILVER
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="mobile-features">FORMS: </span>20
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          QUESTION PER FORM:{' '}
                        </span>
                        100
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          SUBMISSION PER MONTH:{' '}
                        </span>
                        1000
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">TECH SUPPORT: </span>
                        TEXT{' '}
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="information-mark"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Email and ticket based support"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">FILE UPLOADS: </span>
                        5GB
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          NET PROMOTER SCORE:{' '}
                        </span>
                        <div className="available-checkmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          ACCESS TO OUR SLACK CHANNEL:{' '}
                        </span>
                        <div className="unavailable-xmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          SCHEDULED PRIVATE SUPPORT:{' '}
                        </span>
                        <div className="unavailable-xmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td className="silver-price text-white monthly">
                        <span className="price-amount">19$</span> / BILLED
                        MONTHLY
                      </td>
                      <td className="silver-price text-white yearly">
                        <div className="price-block">
                          <div className="price-container">
                            <span className="old-amount">228$</span>
                            <span className="new-amount">99$</span>
                          </div>
                          <div className="price-period">/ BILLED YEARLY</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {user_role === 3 ? (
                  <div className="text-decoration-none text-center purchase-link">
                    <div className="purchase-button current-plan">
                      Current Plan
                    </div>
                  </div>
                ) : user_role > 3 ? null : period === 'pricing-monthly' ? (
                  <a
                    href="settings/billing/silver"
                    target="_blank"
                    className="text-decoration-none text-center purchase-link">
                    <div className="purchase-button">Upgrade</div>
                  </a>
                ) : (
                  <a
                    href="settings/billing/bfsilver"
                    target="_blank"
                    className="text-decoration-none text-center purchase-link">
                    <div className="purchase-button">Upgrade</div>
                  </a>
                )}
              </div>
              <div className="col-md-2 col-sm-6 gold-plan-container">
                <table className="table table-striped table-hover table-borderless gold-plan">
                  <thead>
                    <tr>
                      <th scope="col" className="text-white">
                        GOLD
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="mobile-features">FORMS: </span>200
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          QUESTION PER FORM:{' '}
                        </span>
                        200
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          SUBMISSION PER MONTH:{' '}
                        </span>
                        10K
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">TECH SUPPORT: </span>
                        TEXT{' '}
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="information-mark"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Email and ticket based support"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">FILE UPLOADS: </span>
                        100GB
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          NET PROMOTER SCORE:{' '}
                        </span>
                        <div className="available-checkmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          ACCESS TO OUR SLACK CHANNEL:{' '}
                        </span>
                        <div className="available-checkmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          SCHEDULED PRIVATE SUPPORT:{' '}
                        </span>
                        <div className="unavailable-xmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td className="gold-price text-white monthly">
                        <span className="price-amount">39$</span> / BILLED
                        MONTHLY
                      </td>
                      <td className="gold-price text-white yearly">
                        <div className="price-block">
                          <div className="price-container">
                            <span className="old-amount">468$</span>
                            <span className="new-amount">199$</span>
                          </div>
                          <div className="price-period">/ BILLED YEARLY</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {user_role === 4 ? (
                  <div className="text-decoration-none text-center purchase-link">
                    <div className="purchase-button current-plan">
                      Current Plan
                    </div>
                  </div>
                ) : user_role > 4 ? null : period === 'pricing-monthly' ? (
                  <a
                    href="settings/billing/gold"
                    target="_blank"
                    className="text-decoration-none text-center purchase-link">
                    <div className="purchase-button">Upgrade</div>
                  </a>
                ) : (
                  <a
                    href="settings/billing/bfgold"
                    target="_blank"
                    className="text-decoration-none text-center purchase-link">
                    <div className="purchase-button">Upgrade</div>
                  </a>
                )}
              </div>
              <div className="col-md-2 col-sm-6 diamond-plan-container">
                <table className="table table-striped table-hover table-borderless diamond-plan">
                  <thead>
                    <tr>
                      <th scope="col" className="text-white">
                        <i className="star"></i>DIAMOND
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <span className="mobile-features">FORMS: </span>1000
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          QUESTIONS PER FORM:{' '}
                        </span>
                        1000
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          SUBMISSIONS PER MONTH:{' '}
                        </span>
                        100K
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">TECH SUPPORT: </span>
                        TEXT & VIDEO{' '}
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="information-mark"
                          data-bs-toggle="tooltip"
                          data-bs-placement="top"
                          title="Ability to schedule video calls directly with customer success engineers"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">FILE UPLOADS: </span>
                        500GB
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          NET PROMOTER SCORE:{' '}
                        </span>
                        <div className="available-checkmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          ACCESS TO OUR SLACK CHANNEL:{' '}
                        </span>
                        <div className="available-checkmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <span className="mobile-features">
                          SCHEDULED PRIVATE SUPPORT:{' '}
                        </span>
                        <div className="available-checkmark"></div>
                      </td>
                    </tr>
                    <tr>
                      <td className="diamond-price text-white monthly">
                        <span className="price-amount">99$</span> / BILLED
                        MONTHLY
                      </td>
                      <td className="diamond-price text-white yearly">
                        <div className="price-block">
                          <div className="price-container">
                            <span className="old-amount">1188$</span>
                            <span className="new-amount">499$</span>
                          </div>
                          <div className="price-period">/ BILLED YEARLY</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {user_role === 5 ? (
                  <div className="text-decoration-none text-center purchase-link">
                    <div className="purchase-button current-plan">
                      Current Plan
                    </div>
                  </div>
                ) : period === 'pricing-monthly' ? (
                  <a
                    href="settings/billing/diamond"
                    target="_blank"
                    className="text-decoration-none text-center purchase-link">
                    <div className="purchase-button">Upgrade</div>
                  </a>
                ) : (
                  <a
                    href="settings/billing/bfdiamond"
                    target="_blank"
                    className="text-decoration-none text-center purchase-link">
                    <div className="purchase-button">Upgrade</div>
                  </a>
                )}
              </div>
              <div className="col-md-2 col-sm-6 enterprise-plan-container">
                <table className="table table-striped table-borderless enterprise-plan">
                  <thead>
                    <tr>
                      <th scope="col" className="text-white">
                        ENTERPRISE
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="enterprise-content">
                        ULTIMATE CUSTOMIZATION FOR BUSINESSES
                      </td>
                    </tr>
                    <tr>
                      <td className="enterprise-contact">
                        <div className="contact-support text-white">
                          CONTACT US
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="brand-container">
        <div className="container">
          <div className="row align-items-center justify-content-center py-6 py-md-8 border-bottom">
            <div className="col-12">
              <div className="img-fluid text-gray-600 mb-2 mb-md-0">
                <img
                  alt=""
                  src="https://formpress.org/images/logo_band_colored_noTroytext.svg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Pricing
