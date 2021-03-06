import AppSettings from '/imports/api/appSettings/appSettings';

Meteor.publish(
  'appSettings', function publishAppSettings() {
    if (this.userId) {
      return AppSettings.find();
    }
    const allowedFields = ['version'];
    return AppSettings.find({ _id: {
      $in: allowedFields,
    } });
  }
);
