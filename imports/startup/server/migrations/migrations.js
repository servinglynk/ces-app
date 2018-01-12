import { logger } from '/imports/utils/logger';
import { HmisClient } from '/imports/api/hmisApi';
import Questions from '/imports/api/questions/questions';
import Responses from '/imports/api/responses/responses';
import Surveys from '/imports/api/surveys/surveys';
import Users from '/imports/api/users/users';


export function migrateV1Responses() {
  let count = 0;
  Responses.find().fetch()
    .filter(response => !response.version)
    .forEach(oldResponse => {
      const surveyor = Users.findOne(oldResponse.userID);
      let surveyorId;
      try {
        surveyorId = surveyor.services.HMIS.accountId;
      } catch (e) {
        logger.warn(`No HMIS accountId for user ${oldResponse.userID}, exists? ${!!surveyor}`);
        surveyorId = null;
      }
      // console.log(oldResponse.userID, surveyor);
      // throw new Error();
      const newResponse = {
        ...oldResponse,
        clientId: oldResponse.clientID,
        surveyId: oldResponse.surveyID,
        status: oldResponse.responsestatus,
        surveyorId,
        createdAt: oldResponse.timestamp,
        version: 1,
      };
      delete newResponse.clientID;
      delete newResponse.surveyID;
      delete newResponse.userID;
      delete newResponse.responsestatus;
      Responses.update(newResponse._id, newResponse, { bypassCollection2: true });
      count++;
    });
  logger.info(`Updated ${count} v1 responses`);

  count = 0;
  Questions.find().fetch()
  .filter(question => !question.version)
  .forEach(question => {
    Questions.update(question._id, { $set: { version: 1 } }, { bypassCollection2: true });
    count++;
  });
  logger.info(`Updated ${count} v1 questions`);

  count = 0;
  Surveys.find().fetch()
  .filter(survey => !survey.version)
  .forEach(survey => {
    Surveys.update(survey._id, { $set: { version: 1 } }, { bypassCollection2: true });
    count++;
  });
  logger.info(`Updated ${count} v1 surveys`);

  count = 0;
  Users.find().fetch()
    .filter(user => user._id.length === 17)
    .forEach(user => {
      try {
        const newUser = {
          ...user,
          _id: user.services.HMIS.accountId,
          previousId: user._id,
        };
        count++;
        Users.remove(user._id);
        Users.insert(newUser);
      } catch (e) {
        logger.warn(`Failed to update user ${user._id}: ${e}`);
      }
    });
  logger.info(`Updated ${count} v1 users`);
}


export function fixMissingClientSchemasInV1Responses() {
  const user = Users.findOne({ 'services.HMIS.emailAddress': Meteor.settings.admins[0] });
  logger.info('Fixing missing client schemas in responses...');
  logger.debug('using account', Meteor.settings.admins[0], !!user);
  const hc = HmisClient.create(user);
  let count = 0;
  Responses.find().fetch()
    .filter(response => response.isHMISClient && !response.clientSchema)
    .forEach(response => {
      const { clientId } = response;
      ['v2014', 'v2015', 'v2016', 'v2017'].some(schema => {
        try {
          logger.debug(`Looking for client ${clientId} in schema ${schema}`);
          hc.api('client').getClient(clientId, schema);
          logger.info(`Found ${clientId} in schema ${schema}`);
          Responses.update(response._id, { $set: { clientSchema: schema } });
          count++;
          return true;
        } catch (e) {
          return false;
        }
      });
      logger.warn(`Client ${response.clientId} not found in any schema`);
      return false;
    });
  logger.info(`Fixed client schemas in ${count} responses`);
}

