import { Template } from 'meteor/templating';
import Survey from '/imports/ui/components/surveyForm/Survey';
import { DefaultAdminAccessRoles } from '/imports/config/permissions';
import './responsesNew.html';


Template.responsesNew.helpers({
  component() {
    return Survey;
  },
  definition() {
    const definition = JSON.parse(this.survey.definition);
    return {
      ...definition,
      title: definition.title || this.survey.title,
    };
  },
  surveyId() {
    return this.survey._id;
  },
  initialValues() {
    const definition = JSON.parse(this.survey.definition);
    return definition.initialValues;
  },
  user() {
    const user = Meteor.user();
    const data = user && user.services && user.services.HMIS || {};
    return {
      userId: user._id,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      emailAddress: data.emailAddress,
    };
  },
  isAdmin() {
    return Roles.userIsInRole(Meteor.userId(), DefaultAdminAccessRoles);
  },
});
