import FeatureDecisions from '/imports/both/featureDecisions';
import { FilesAccessRoles } from '/imports/config/permissions';
import { AppController } from './controllers';
// import { ContentController } from './controllers';
import '/imports/ui/submissionUploader/submissionUploaderList';
import '/imports/ui/submissionUploader/submissionUploaderNew';

const featureDecisions = FeatureDecisions.createFromMeteorSettings();
if (featureDecisions.isSubmissionUploader()) {
  Router.route('submissionUploaderList', {
    path: '/submissionUploader/list',
    template: Template.submissionUploaderList,
    // controller: ContentController,
    controller: AppController,
    authorize: {
      allow() {
        return Roles.userIsInRole(Meteor.userId(), FilesAccessRoles);
      },
    },
    waitOn() {
      return [
        Meteor.subscribe('submissionUploader.all'),
      ];
    },
    data() {
      return {
        title: 'Submission Uploader',
        subtitle: 'List',
      };
    },
  });

  Router.route('submissionUploaderNew', {
    path: '/submissionUploader/new',
    template: Template.submissionUploaderNew,
    // controller: ContentController,
    controller: AppController,
    authorize: {
      allow() {
        return Roles.userIsInRole(Meteor.userId(), FilesAccessRoles);
      },
    },
    waitOn() {
      return [
        Meteor.subscribe('surveyConfigs.all'),
        Meteor.subscribe('surveys.all'),
      ];
    },
    data() {
      return {
        title: 'Submission Uploader',
        subtitle: 'New',
      };
    },
  });
}
