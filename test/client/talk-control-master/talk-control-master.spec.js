'use strict';

import 'module-alias/register';
import { expect, assert } from 'chai';
import { stub } from 'sinon';
import socketIOClient from 'socket.io-client';
import { TalkControlMaster } from '@client/talk-control-master/talk-control-master';
import { MAIN_CHANNEL } from '@event-bus/event-bus-resolver';

describe('', function() {
    let talkControlMaster;

    before(function() {
        // Needed otherwise there will be an error because there is no server to connect to
        stub(socketIOClient, 'connect').returns({ on: stub() });
    });

    beforeEach(function() {
        talkControlMaster = new TalkControlMaster();
    });

    after(function() {
        socketIOClient.connect.restore();
    });

    describe('constructor()', function() {
        it('should have instantiated TalkControlMaster', function() {
            expect(talkControlMaster).to.be.ok;
        });
    });

    describe('init()', function() {
        let inputPresentation, btnValidate, stageFrame, urlError;

        beforeEach(function() {
            // Display mock
            inputPresentation = { value: 'http://test.com:8080', addEventListener: stub() };
            btnValidate = { addEventListener: stub() };
            stageFrame = { src: '', classList: { add: () => (stageFrame.hidden = true), remove: () => (stageFrame.hidden = false) }, hidden: true };
            urlError = { classList: { add: () => (urlError.hidden = true), remove: () => (urlError.hidden = false) }, hidden: true };

            const getElementById = stub(document, 'getElementById');
            getElementById.withArgs('inputPresentation').returns(inputPresentation);
            getElementById.withArgs('btnValidate').returns(btnValidate);
            getElementById.withArgs('stageFrame').returns(stageFrame);
            getElementById.withArgs('urlError').returns(urlError);

            stub(talkControlMaster, 'afterInitialisation');
            stub(talkControlMaster, 'forwardEvents');
        });

        afterEach(function() {
            document.getElementById.restore();
        });

        it('should have displayed the iframe when btnValidate is clicked', function() {
            // Given
            let btnCallback;
            btnValidate.addEventListener = (_, callback) => (btnCallback = callback);
            // When
            talkControlMaster.init();
            btnCallback();
            // Then
            expect(urlError.hidden).to.be.true;
            expect(stageFrame.hidden).to.be.false;
            expect(stageFrame.src).to.be.equals(inputPresentation.value);
        });

        it('should have displayed the iframe when enter is pushed on inputPresentation', function() {
            // Given
            let inputCallback;
            inputPresentation.addEventListener = (_, callback) => (inputCallback = callback);
            // When
            talkControlMaster.init();
            inputCallback({ keyCode: 13 });
            // Then
            expect(stageFrame.hidden).to.be.false;
            expect(stageFrame.src).to.be.equals(inputPresentation.value);
        });

        it('should not displayed the iframe when another key is pushed on inputPresentation', function() {
            // Given
            let inputCallback;
            inputPresentation.addEventListener = (_, callback) => (inputCallback = callback);
            // When
            talkControlMaster.init();
            inputCallback({ keyCode: 12 });
            // Then
            expect(stageFrame.hidden).to.be.true;
            expect(stageFrame.src).to.be.equals('');
        });

        it('should have shown an error because there is no URL given', function() {
            // Given
            let btnCallback;
            btnValidate.addEventListener = (_, callback) => (btnCallback = callback);
            inputPresentation.value = '';
            // When
            talkControlMaster.init();
            btnCallback();
            // Then
            expect(urlError.hidden).to.be.false;
            expect(stageFrame.hidden).to.be.true;
        });
    });

    describe('_onKeyUp', function() {
        let mainChannel;
        beforeEach(function() {
            // Event mock
            mainChannel = talkControlMaster.eventBus.channels[MAIN_CHANNEL];
            stub(mainChannel, 'emit');
        });

        afterEach(function() {
            mainChannel.emit.restore();
        });

        it('should fire "arrowUp" event', function() {
            // Given
            const event = new Event('keyup');
            event.key = 'ArrowUp';
            // When
            talkControlMaster._onKeyUp(event);
            // Then
            assert(mainChannel.emit.calledOnceWith('keyPressed', { key: 'arrowUp' }));
        });

        it('should fire "arrowDown" event', function() {
            // Given
            const event = new Event('keyup');
            event.key = 'ArrowDown';
            // When
            talkControlMaster._onKeyUp(event);
            // Then
            assert(mainChannel.emit.calledOnceWith('keyPressed', { key: 'arrowDown' }));
        });

        it('should fire "arrowLeft" event', function() {
            // Given
            const event = new Event('keyup');
            event.key = 'ArrowLeft';
            // When
            talkControlMaster._onKeyUp(event);
            // Then
            assert(mainChannel.emit.calledOnceWith('keyPressed', { key: 'arrowLeft' }));
        });

        it('should fire "arrowRight" event', function() {
            // Given
            const event = new Event('keyup');
            event.key = 'ArrowRight';
            // When
            talkControlMaster._onKeyUp(event);
            // Then
            assert(mainChannel.emit.calledOnceWith('keyPressed', { key: 'arrowRight' }));
        });

        it("shouldn't fire any event", function() {
            // Given
            const event = new Event('keyup');
            event.key = undefined;
            // When
            talkControlMaster._onKeyUp(event);
            // Then
            assert(mainChannel.emit.notCalled);
        });
    });
});
