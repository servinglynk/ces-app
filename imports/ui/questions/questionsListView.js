import { populateOptions, resetQuestionModal, setFields } from '/imports/ui/questions/helpers';
import { TableDom, editButton, deleteQuestionButton } from '/imports/ui/dataTable/helpers';
import moment from 'moment';
import Questions from '/imports/api/questions/questions';
import './questionsListView.html';


const tableOptions = {
  columns: [
    {
      title: 'Title',
      data: 'title',
      render(value) {
        if (value.length > 50) {
          return `${value.substring(0, 47)}...`;
        }
        return value;
      },
    },
    {
      title: 'Category',
      data: 'category',
    },
    {
      title: 'Date created',
      data: 'createdAt',
      render(value) {
        return moment(value).format('MM/DD/YYYY h:mm A');
      },
    },
    {
      title: 'Date updated',
      data: 'updatedAt',
      render(value) {
        return moment(value).format('MM/DD/YYYY h:mm A');
      },
    },
    editButton('questionsEdit'),
    {
      data: '_id',
      title: 'Clone',
      render() {
        return '';
      },
      createdCell(node, cellData) {
        const data = {
          path: 'questionsNew',
          query: `source=${cellData}`,
          _id: cellData,
        };
        Blaze.renderWithData(Template.DataTableEditButton, data, node);
      },
      width: '45px',
      orderable: false,
    },
    deleteQuestionButton(),
  ],
  dom: TableDom,
};


Template.questionsListView.helpers({
  hasData() {
    return Questions.find().count() > 0;
  },
  tableData() {
    return () => Questions.find().fetch();
  },
  tableOptions() {
    return tableOptions;
  },

  questionList() {
    return Questions.find({}).fetch();
  },

});

Template.questionsListView.events(
  {
    'click .addQuestion': (/* evt, tmpl*/) => {
      $('#aoptions').empty();
      resetQuestionModal();
      $('.showWhenEdit').hide();
      $('.showWhenNew').show();
      $('#isUploaded').val('');
      setFields(false);
    },
    'click .edit': (evt) => {
      evt.preventDefault();
      $('#aoptions').empty();
      // let txt1;
      // let optionsTag;
      const question = Questions.findOne({ _id: $(evt.currentTarget).data('survey-id') });

      $('#q_category').val(question.category).change();
      $('#q_name').val(question.name);
      $('#question').summernote('code', question.question);
      $('#q_dataType').val(question.dataType).change();
      $('#q_type').val(question.qtype).change();
      $('#q_audience').val(question.audience).change();
      if (question.options != null) {
        // optionsTag = '';
        populateOptions(question);
      }

      $('#newQuestionModal input[type=checkbox]#isCopy').attr('checked', question.isCopy);
      $('#newQuestionModal input[type=checkbox]#isCopy').prop('checked', question.isCopy);

      $('#newQuestionModal input[type=checkbox]#locked').attr('checked', question.locked);
      $('#newQuestionModal input[type=checkbox]#locked').prop('checked', question.locked);

      $('#newQuestionModal input[type=checkbox]#allowSkip').attr('checked', question.allowSkip);
      $('#newQuestionModal input[type=checkbox]#allowSkip').prop('checked', question.allowSkip);

      $('#isUpdate').val('1');
      $('#isUploaded').val(question.surveyServiceQuesId).change();
      $('#questionID').val($(evt.currentTarget).data('survey-id'));

      $('.showWhenEdit').show();
      $('.showWhenNew').hide();
      if (question.locked) {
        setFields(true);
      } else {
        setFields(false);
      }
    },
  }
);

