import React, { useState } from 'react';
import ClientTabSelector from './ClientTabSelector';
import ClientGeneralInfo from './ClientGeneralInfo';
import ClientOverview from './ClientOverview';
import ClientTab from './ClientTab';
import ClientEnrollments from './ClientEnrollments';
import ClientEligibility from './ClientEligibility';
import CaseNotes from './CaseNotes';
import ClientReferrals from './ClientReferrals';
import MatchingContainer from '/imports/ui/components/matching/MatchingContainer';
import ClientFiles from './ClientFiles';


function ClientLayout(props) {
  const { client, permissions, eligibleClient, data, helpers } = props;
  const {
    showReferralStatus,
    showCaseNotes,
    // showEnrollments,
    // updateEnrollment,
    // annualEnrollment,
    // exitEnrollment,
    isSkidrowApp,
    showEditButton,
  } = permissions;

  // TODO: feature decisions
  const tabsList = [
    { id: 'overview', enabled: true, title: 'Overview' },
    { id: 'eligibility', enabled: true, title: 'History' },
    { id: 'rois', enabled: !isSkidrowApp, title: 'ROIs' },
    { id: 'referrals', enabled: showReferralStatus, title: 'Referrals' },
    // { id: 'enrollments', enabled: showEnrollments, title: 'Enrollments' },
    // { id: 'create-enrollment', enabled: showEnrollments, title: 'Create Enrollment' },
    // { id: 'update-enrollment', enabled:
    //   showEnrollments && updateEnrollment, title: 'Update Enrollment' },
    // { id: 'annual-enrollment', enabled:
    //   showEnrollments && annualEnrollment, title: 'Annual Enrollment' },
    // { id: 'exit-enrollment', enabled:
    //   showEnrollments && exitEnrollment, title: 'Exit Enrollment' },
    { id: 'client-tags', enabled: !isSkidrowApp, title: 'Tags' },
    // { id: 'services', enabled: !isSkidrowApp, title: 'Services' },
    // { id: 'case-management', enabled: false, title: 'Case Management' },
    // { id: 'responses', enabled: false, title: 'Responses' },
    // { id: 'matching', enabled: showReferralStatus, title: 'New Referral' },
    { id: 'case-notes', enabled: showCaseNotes, title: 'Case Notes' },
    { id: 'files', enabled: true, title: 'Files' },
  ].filter((t) => t.enabled);

  const [selectedTab, selectTab] = useState(props.selectedTab || tabsList[0].id);

  // console.log('selectedTab', selectedTab);

  const isRemovedFromMatching = eligibleClient && eligibleClient.ignoreMatchProcess;
  const isInActiveList = eligibleClient && eligibleClient.ignoreMatchProcess === false;

  return (
    <div id="viewClient_content" className="col-xs-12">

      {eligibleClient && isRemovedFromMatching &&
        <div className="col-xs-12">
          <div className="alert alert-danger">
            Client has been Removed from Matching
          </div>
        </div>
      }
      {eligibleClient && isInActiveList &&
        <div className="col-xs-12">
          <div className="alert alert-success">
            Client is on the Active list
          </div>
        </div>
      }
      <div className="row client-profile-container">
        <ClientGeneralInfo client={client} helpers={helpers.generalInfo} />

        <div className="tab-section">
          <ClientTabSelector tabs={tabsList} tab={selectedTab} selectTab={selectTab} />

          <div className="tab-content card">
            <ClientTab selectedTab={selectedTab} id={'overview'} >
              <ClientOverview
                client={client} permissions={{ showEditButton }} helpers={helpers.overview}
              />
            </ClientTab>
            <ClientTab selectedTab={selectedTab} id={'referrals'} >
              <ClientReferrals
                eligibleClient={data.eligibleClient()}
                client={client}
                permissions={permissions}
                helpers={helpers.referrals}
              />
            </ClientTab>
            <ClientTab selectedTab={selectedTab} id={'eligibility'} >
              <ClientEligibility
                eligibleClient={data.eligibleClient()}
                client={client} permissions={{ showEditButton }} helpers={helpers.eligibility}
              />
            </ClientTab>
            <ClientTab selectedTab={selectedTab} id={'enrollments'} >
              <ClientEnrollments
                client={client}
                permissions={{ showEditButton }}
                enrollments={data.enrollments()}
                helpers={helpers.enrollments}
              />
            </ClientTab>

            {showCaseNotes && <ClientTab selectedTab={selectedTab} id={'case-notes'} >
              <CaseNotes client={client} />
            </ClientTab>}

            <ClientTab selectedTab={selectedTab} id={'files'} >
              <ClientFiles client={client} />
            </ClientTab>

            <ClientTab selectedTab={selectedTab} id={'matching'} >
              <MatchingContainer
                helpers={helpers.referrals}
              />
            </ClientTab>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientLayout;
