import App from "../app";
import { exec } from 'child_process';

jest.mock('child_process', () => {
  return {
    exec: jest.fn((cmd, cb) => cb(null, 'called', ''))
  }
});

//const app: App = new App();
const message = {
  type: '',
  scope: '',
  description: '',
  body: '',
  issue: '',
  emoji: '',
};

describe('App', () => {

  let app!: App
  beforeEach(() => {
    app = new App()
  })

  describe(".validate", function() {

    it("Should fail if commit message is not given", function() {
      message.type = 'feat';

      try {
        app.validate(message);
      } catch (e) {
        expect(e.message).toContain('Commit must have a description');
      }
    });

    it("Should fail if commit has no type", function() {
      message.type = '';

      try {
        app.validate(message);
      } catch (e) {
        expect(e.message).toContain('Commit must have a type');
      }
    });

    it("Should fail if issue is a string", function() {
      message.type = 'feat';
      message.description = 'some kind of commit';
      message.issue = 'hello';

      try {
        app.validate(message);
      } catch (e) {
        expect(e.message).toContain('Issue must be an integer');
      }
    });

    it("Should fail if issue is a float", function() {
      message.type = 'feat';
      message.description = 'some kind of commit';
      message.issue = '1.22';

      try {
        app.validate(message);
      } catch (e) {
        expect(e.message).toContain('Issue must be an integer');
      }
    });

    it("Should pass if issue is a integer", function() {
      message.type = 'feat';
      message.description = 'some kind of commit';
      message.issue = '1';

      app.validate(message);
    });
  });

  describe(".getCommitMessage", () => {
    it('Should generate a commit message', function() {
      message.type = 'feat';
      message.description = 'some kind of commit';

      const msg = app.getCommitMessage(message);

      expect(msg).toContain(message.type);
      expect(msg).toContain(message.description);
    });

    it('Should generate a commit message with scope', function() {
      message.type = 'feat';
      message.description = 'some kind of commit';
      message.scope = 'lang';

      const msg = app.getCommitMessage(message);

      expect(msg).toContain(message.type);
      expect(msg).toContain(message.description);
      expect(msg).toContain(`(${message.scope})`);
    });

    it('Should generate a commit message with issue', function() {
      message.type = 'feat';
      message.description = 'some kind of commit';
      message.scope = 'lang';
      message.issue = '1';

      const msg = app.getCommitMessage(message);

      expect(msg).toContain(message.type);
      expect(msg).toContain(message.description);
      expect(msg).toContain(`#${message.issue}`);
    });
  });

  describe('.commitChanges', () => {
    it('Should commit changes', async () => {
      const testString = 'test string';
      const response = await app.commitChanges(testString);
      expect(exec).toBeCalledWith(`git commit -m '${testString}'`, expect.anything());
    });

    it('Should commit changes and stage untracked changes', async () => {
      const testString = 'test string';
      const response = await app.commitChanges(testString, {add: true, sign: false});
      expect(exec).toBeCalledWith(`git add .`, expect.anything());

      expect(exec).toBeCalledWith(`git commit -m '${testString}'`, expect.anything());
    });

    it('Should commit changes and sign the commit', async () => {
      const testString = 'test string';
      const response = await app.commitChanges(testString, {add: false, sign: true});
      expect(exec).toBeCalledWith(`git commit -S -m '${testString}'`, expect.anything());
    });

    it('Should commit changes, sign the commit, and add untracked', async () => {
      const testString = 'test string';
      const response = await app.commitChanges(testString, {add: true, sign: true});
      expect(exec).toBeCalledWith(`git add .`, expect.anything());
      expect(exec).toBeCalledWith(`git commit -S -m '${testString}'`, expect.anything());
    });
  });
})
