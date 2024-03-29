'use strict';

import 'module-alias/register';
import { expect, assert } from 'chai';
import { spy, stub } from 'sinon';
import { RevealEngine } from '@client/engines/revealjs-client-engine';

describe('RevealEngineClient', function() {
    let engine;
    beforeEach(function() {
        window.Reveal = {
            getCurrentSlide: stub(),
            configure: spy(),
            next: spy(),
            up: spy(),
            down: spy(),
            left: spy(),
            right: spy(),
            slide: spy(),
            getIndices: stub(),
            addEventListener: spy(),
            getSlides: stub()
        };
        stub(window, 'addEventListener');
        stub(window.parent, 'postMessage');

        engine = new RevealEngine();
    });

    afterEach(function() {
        window.addEventListener.restore();
        window.parent.postMessage.restore();
    });

    describe('constructor()', function() {
        it('should have instantiated RevealEngine', function() {
            expect(engine).to.be.ok;
        });
    });

    describe('forwardMessageFromRemote()', function() {
        it('should initialise Reveal', function() {
            // Given
            const message = {
                type: 'init',
                data: null
            };
            // When
            engine.forwardMessageFromRemote(message);
            // Then
            expect(window.Reveal.configure.calledOnce);
        });

        it('should call this.gotoSlide()', function() {
            // Given
            stub(engine, 'goToSlide');
            const message = {
                type: 'changeSlide',
                data: { h: 0, v: 0, f: 0 }
            };
            // When
            engine.forwardMessageFromRemote(message);
            // Then
            expect(engine.goToSlide.calledOnceWith(0, 0, 0));
            engine.goToSlide.restore();
        });
    });

    describe('goToSlide()', function() {
        it('should call Reveal.slide() with the given params', function() {
            // When
            engine.goToSlide({ h: 1, v: 2, f: 3 });
            // Then
            assert(window.Reveal.slide.calledOnceWith(1, 2, 3));
        });
    });

    describe('getSlides()', function() {
        it('should return an array of slides', function() {
            // Given
            const querySelectorAll = stub().returns([]);
            window.Reveal.getSlides.returns([
                { querySelectorAll, dataset: { indexH: 0, indexV: 0 } },
                { querySelectorAll, dataset: { indexH: 1, indexV: 0 } },
                { querySelectorAll, dataset: { indexH: 2, indexV: 0 } }
            ]);
            // When
            const slides = engine.getSlides();
            // Then
            expect(slides.length).to.equals(3);
            expect(slides[0]).to.eqls({ h: 0, v: 0, f: 0, fMax: 0 });
        });
    });
});
