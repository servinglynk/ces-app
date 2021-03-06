import React from 'react';
import Alert from '/imports/ui/alert';
import Questions from '/imports/api/questions/questions';
import GridItemForm from '/imports/ui/components/surveyBuilder/GridItemForm';
import QuestionItemForm from '/imports/ui/components/surveyBuilder/QuestionItemForm';

class QuestionEditForm extends React.Component {
  constructor(props) {
    super(props);

    let definition;
    try {
      definition = JSON.parse(props.question.definition);
    } catch (e) {
      definition = {};
    }
    this.state = {
      submitting: false,
      definition,
    };

    this.onValueChange = this.onValueChange.bind(this);
    this.handleUpdateQuestion = this.handleUpdateQuestion.bind(this);
    this.handleDeleteQuestion = this.handleDeleteQuestion.bind(this);
  }

  onValueChange(name, value) {
    if (name === 'type') {
      if (value !== 'grid' || value !== 'question') {
        return;
      }
    }
    this.setState({
      definition: {
        ...this.state.definition,
        [name]: value,
      },
    });
  }

  handleUpdateQuestion() {
    const id = this.props.question.questionId;
    this.setState({ submitting: true });
    Meteor.call('questions.update', id, {}, (err) => {
      this.setState({ submitting: false });
      if (err) {
        Alert.error(err);
      } else {
        Alert.success('Question updated');
      }
    });
  }

  handleDeleteQuestion() {
    const { questionGroupId, questionId } = this.props.question;
    this.setState({ submitting: true });
    Meteor.call('questions.delete', questionGroupId, questionId, (err) => {
      this.setState({ submitting: false });
      if (err) {
        Alert.error(err);
      } else {
        Alert.success('Question deleted');
        Questions._collection.remove(questionId); // eslint-disable-line
        Router.go('questionsView');
      }
    });
  }

  renderForm() {
    const item = this.state.definition;
    switch (item.type) {
      case 'grid':
        return (<GridItemForm
          onChange={this.onValueChange}
          model={item}
          isInFormBuilder={false}
        />);
      case 'question':
        return (<QuestionItemForm
          onChange={this.onValueChange}
          model={item}
          isInFormBuilder={false}
        />);
      default:
        return (<p>{item.type} is not editable. Only grid and question is allowed.</p>);
    }
  }

  render() {
    const { questionId } = this.props.question;
    return (
      <div>
        <div><strong>Question Id:</strong> {questionId}</div>
        {this.renderForm()}
        <p>TODO: add meta fields</p>
        <button
          className="btn btn-primary"
          onClick={this.handleUpdateQuestion}
          disabled={this.state.submitting}
        >
          Update
        </button>
        &nbsp;
        <button
          className="btn btn-danger"
          onClick={this.handleDeleteQuestion}
          disabled={this.state.submitting}
        >
          Delete
        </button>
      </div>
    );
  }
}

export default QuestionEditForm;
