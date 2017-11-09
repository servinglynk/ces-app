import { HmisClient } from '/imports/api/hmisApi';
import Surveys from '/imports/api/surveys/surveys';
import { computeFormState, findItem } from '/imports/api/surveys/computations';
import { logger } from '/imports/utils/logger';
import { escapeKeys, unescapeKeys } from '/imports/api/utils';
import Responses, { ResponseStatus } from '/imports/api/responses/responses';

function prepareResponseUploadBody(values, variables, definition) {
  const questionIds = Object.keys(values);
  const responses = questionIds.map(id => {
    const question = findItem(id, definition);
    return {
      id,
      hmisId: question.hmisId,
      value: values[id],
    };
  });
  const scores = Object.keys(variables).filter(v => v.indexOf('score') === 0);
  console.log(responses);
  console.log(scores);
}

Meteor.methods({
  'responses.create'(doc) {
    logger.info(`METHOD[${Meteor.userId()}]: responses.create`, doc);
    check(doc, Object);
    const surveyorId = Meteor.users.findOne(Meteor.userId()).services.HMIS.id;
    const response = Object.assign({}, doc, {
      surveyorId,
      status: ResponseStatus.COMPLETED,
      submissionId: null,
      values: escapeKeys(doc.values),
    });

    // TODO: check permissions
    check(response, Responses.schema);
    return Responses.insert(response);
  },
  'responses.update'(id, doc) {
    logger.info(`METHOD[${Meteor.userId()}]: responses.update`, id, doc);
    check(id, String);
    check(doc, Object);

    const oldResponse = Responses.findOne(id);

    const response = Object.assign({}, doc, {
      status: ResponseStatus.COMPLETED,
      values: escapeKeys(doc.values),
      surveyorId: oldResponse.surveyorId,
    });
    check(response, Responses.schema);
    // TODO: check permissions
    return Responses.update(id, { $set: response });
  },
  'responses.delete'(id) {
    logger.info(`METHOD[${Meteor.userId()}]: responses.delete`, id);
    // TODO: check permissions
    check(id, String);
    return Responses.remove(id);
  },

  'responses.uploadToHmis'(id) {
    check(id, String);
    Responses.update(id, { $set: { status: ResponseStatus.UPLOADIND } });

    const response = Responses.findOne(id);
    const { clientId, surveyId, values } = response;

    const survey = Surveys.findOne(surveyId);
    const definition = JSON.parse(survey.definition);
    console.log(definition);

    try {
      const hc = HmisClient.create(Meteor.userId());
      const client = hc.api('client').getClient(response.clientId, response.clientSchema);
      const formState = computeFormState(definition, response.values, {}, { client });
      console.log(formState.variables);
      const body = prepareResponseUploadBody(values, formState.variables, definition);
      console.log(body);
      return;
    } catch (err) {
      throw new Meteor.Error(err);
    }


    // TODO: check if survey exists in hsLink


    // TODO: check survey update time < response time

    // check all questions exists?



    const escaped = unescapeKeys(values);
    const valuesToSend = Object.keys(escaped).map(key => ({
      questionId: key,
      responseText: escaped[key],
    }));

    try {
      const hc = HmisClient.create(Meteor.userId());
      hc.api('survey').sendResponses(clientId, surveyId, valuesToSend);
      Responses.update(id, { $set: { status: ResponseStatus.UPLOADED } });
    } catch (err) {
      Responses.update(id, { $set: { status: ResponseStatus.COMPLETED } });
      throw err;
    }
  },

  /*
  sendResponse(clientId, surveyId, responses) {
    logger.info(`METHOD[${Meteor.userId()}]: sendResponse`, clientId, surveyId, responses);
    const hc = HmisClient.create(Meteor.userId());
    // will send all at one time.
    return hc.api('survey').sendResponses(clientId, surveyId, responses);
  },

  updateSubmissionIdForResponses(_id, submissionId) {
    logger.info(`METHOD[${Meteor.userId()}]: updateSubmissionIdForResponses`, _id, submissionId);
    Responses.update(_id, { $set: { submissionId } });
  },
  updateResponseStatus(_id, responsestatus) {
    logger.info(`METHOD[${Meteor.userId()}]: updateResponseStatus`, _id, responsestatus);
    Responses.update(_id, { $set: { responsestatus } });
  },

  uploadResponse(responseId) {
    logger.info(`METHOD[${Meteor.userId()}]: uploadResponse`, responseId);
    this.unblock();
    // Checking if SPDAT or HUD. If SPDAT, then only upload.
    try {
      const response = Responses.findOne({ _id: responseId });
      const survey = Surveys.findOne({ _id: response.surveyID });
      if (survey.stype !== 'hud') {
        Meteor.call('updateResponseStatus', responseId, 'Uploading');

        logger.debug('sending response to HMIS', responseId);
        const sendResponseToHmisSync = Meteor.wrapAsync(
          responseHmisHelpers.sendResponseToHmis);
        const res = sendResponseToHmisSync(responseId, {}, true);

        if (res) {
          logger.debug('calculating response score', responseId);
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
          logger.debug('sending score to HMIS', responseId, score);

          Meteor.call('sendScoresToHMIS', survey.apiSurveyServiceId,
                                  response.clientID, score);

          // save the submission Id.
          logger.debug('updating submission id', responseId);
          Meteor.call('updateSubmissionIdForResponses', responseId, res.submissionId);
        } else {
          throw new Meteor.Error('Error sending Response to Hmis');
        }
      } else {
        throw new Meteor.Error('Response upload for HUD not implemented');
      }
    } catch (e) {
      logger.error(e);
      throw e;
    } finally {
      // TODO: ???
      Meteor.call('updateResponseStatus', responseId, 'Completed');
    }
  },
  */
});
