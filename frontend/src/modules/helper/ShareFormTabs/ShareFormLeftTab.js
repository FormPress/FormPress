import React from 'react';
import './ShareFormLeftTab.css'

const ShareFormLeftTab = ({backEnd, embedCode, formId}) => {
	return <div className="shareFormLeftTab col-6-16">
		<div>
      Form URL:{' '}
      <input
        type="text"
        value={`${backEnd}/form/view/${formId}`}
        className="formURL"
        readOnly
      />
    </div>
    <div>
      Form Embed Code: <br />
      <textarea className="embedCode" value={embedCode} readOnly />
    </div>
	</div>
}

export default ShareFormLeftTab;
