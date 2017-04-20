/**
 * Created by Mj on 10/1/2016.
 */
import { HmisClient } from '/imports/api/hmis-api';

Meteor.methods(
  {
    sendResponse(clientId, surveyId, responses) {
      const hc = HmisClient.create(Meteor.userId());

      // will send all at one time.
      return hc.api('survey').addResponseToHmis(clientId, surveyId, responses);
    },
    updateSubmissionIdForResponses(_id, submissionId) {
      responses.update(_id, { $set: { submissionId } });
      logger.info('Response Submission Id Added to mongo');
    },
    updateResponseStatus(_id, responsestatus) {
      responses.update(_id, { $set: { responsestatus } });
    },
    uploadResponse(responseId) {
      this.unblock();
      // Checking if SPDAT or HUD. If SPDAT, then only upload.
      try {
        const response = responses.findOne({ _id: responseId });
        const survey
          = surveys.findOne({ _id: response.surveyID });
        if (survey.stype !== 'hud') {
          Meteor.call('updateResponseStatus', responseId, 'Uploading');

          const sendResponseToHmisSync = Meteor.wrapAsync(
            responseHmisHelpers.sendResponseToHmis);
          const res = sendResponseToHmisSync(responseId, {}, true);

          if (res) {
            // Calculate the scores now and send them too.
            let score;
            // Send response Id, survey Id and fromDb to true to score helpers.
            switch (survey.stype) {
              case 'spdat-t':
                score = spdatScoreHelpers.calcSpdatTayScore(survey._id, responseId, true);
                // upload the scores too.
                break;
              case 'spdat-f':
                score = spdatScoreHelpers.calcSpdatFamilyScore(survey._id, responseId, true);
                break;
              case 'spdat-s':
                score = spdatScoreHelpers.calcSpdatSingleScore(survey._id, responseId, true);
                break;
              default:
                score = 0;
                // Should be other than VI-SPDAT.
                break;
            }
            // On getting the scores, update them.
            Meteor.call('sendScoresToHMIS', survey.apiSurveyServiceId,
                                    response.clientID, score);

            // save the submission Id.
            Meteor.call('updateSubmissionIdForResponses', responseId, res.submissionId);
          } else {
            throw new Meteor.Error('Error sending Response to Hmis');
          }
        } else {
          throw new Meteor.Error('Response upload for HUD not implemented');
        }
      } catch (e) {
        logger.error(e);
        logger.error(e.details);
        throw e;
      } finally {
        Meteor.call('updateResponseStatus', responseId, 'Completed');
      }
    },
  }
);
