/**
 * Created by udit on 13/12/15.
 */
surveys = new Meteor.Collection( 'surveys' );

Schemas.surveys = new SimpleSchema( {
	title: {
		type: String,
		max: 256
	},
	active: {
		type: Boolean
	},
	copy: {
		type: Boolean
	},
	stype: {
		type: String,
		max: 256
	},
	surveyCopyID:{
		type: String,
		optional:true,
		max: 256
	},
	createdAt: {
		type: Date,
		label: 'Created At',
		autoValue: function () {
			if ( this.isInsert ) {
				return new Date();
			}
		}
	},
	updatedAt: {
		type: Date,
		label: 'Updated At',
		autoValue: function() {
			return new Date();
		}
	},
	created:{
		type: Boolean
	}
	//author: {
	//	type: String,
	//	regEx: SimpleSchema.RegEx.Id,
	//	autoValue: function () {
	//		if ( this.isInsert ) {
	//			return Meteor.userId();
	//		}
	//	},
	//	autoform: {
	//		options: function () {
	//			return _.map(Meteor.users.find().fetch(), function (user) {
	//				return {
	//					label: user.emails[0].address,
	//					value: user._id
	//				};
	//			} );
	//		}
	//	}
	//}
} );

surveys.attachSchema( Schemas.surveys );
