import { Mongo } from 'meteor/mongo';

const Responses = new Mongo.Collection('responses');

Responses.schema = new SimpleSchema({
  clientID: {
    type: String,
  },
  isHMISClient: {
    type: Boolean,
    optional: true,
  },
  clientSchema: {
    type: String,
    optional: true,
  },
  surveyID: {
    type: String,
  },
  userID: {
    type: String,
  },
  responsestatus: {
    type: String,
  },
  submissionId: {
    type: String,
    optional: true,
  },
  timestamp: {
    type: Date,
    label: 'Timestamp',
    autoValue() {
      let returnstatus;
      if (this.isInsert) {
        returnstatus = new Date();
      } else if (this.isUpsert) {
        returnstatus = { $setOnInsert: new Date() };
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
      return returnstatus;
    },
  },
  'section.$': {
    type: [Object],
    optional: true,
  },
  'section.$.sectionID': {
    type: String,
    optional: true,
  },
  'section.$.name': {
    type: String,
    optional: true,
  },
  'section.$.skip': {
    type: Boolean,
    optional: true,
  },
  'section.$.response': {
    type: [Object],
    optional: true,
  },
  'section.$.response.$.questionID': {
    type: String,
  },
  'section.$.response.$.answer': {
    type: String,
    optional: true,
  },
});

Responses.attachSchema(Responses.schema);

export default Responses;