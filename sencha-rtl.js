Ext.define('Ext.util.DraggableRtl', {
    override: 'Ext.util.Draggable',
    getContainerConstraint: function () {
        var container = this.getContainer(),
            element = this.getElement();

        if (!container || !element.dom) {
            return this.defaultConstraint;
        }

        var dom = element.dom,
            containerDom = container.dom,
            width = dom.offsetWidth,
            height = dom.offsetHeight,
            containerWidth = containerDom.offsetWidth,
            containerHeight = containerDom.offsetHeight;

        return {
            min: {
                x: -(containerWidth - width),
                y: -(containerHeight - height)
            },
            max: {
                x: 0,
                y: 0
            }
        };
    }
});

Ext.define('Ext.slider.SliderRtl', {
    override: 'Ext.slider.Slider',
    constrainValue: function (value) {

        var me = this,
            minValue = me.getMinValue(),
            maxValue = me.getMaxValue(),
            increment = me.getIncrement(),
            remainder;
        value = parseFloat(value);

        if (isNaN(value)) {
            value = minValue;
        } else {
            value *= -1;
        }

        remainder = value % increment;
        value -= remainder;
        if (Math.abs(remainder) >= (increment / 2)) {
            value += (remainder > 0) ? increment : -increment;
        }
        value = Math.max(minValue, value);
        value = Math.min(maxValue, value);
        return value * -1;
    },
    setIndexValue: function (index, value, animation) {

        var thumb = this.getThumb(index),
            values = this.getValue(),
            offsetValueRatio = this.offsetValueRatio,
            draggable = thumb.getDraggable();

        draggable.setOffset(value * offsetValueRatio, null, animation);
        values[index] = -1 * value;
    },
    applyValue: function (value) {
        var values = Ext.Array.from(value || 0),
            filteredValues = [],
            previousFilteredValue = this.getMinValue(),
            filteredValue, i, ln;

        for (i = 0, ln = values.length; i < ln; i++) {
            filteredValue = this.constrainValue(values[i] * -1);
            if (filteredValue > previousFilteredValue) {
                //<debug warn>
                Ext.Logger.warn("Invalid values of '" + Ext.encode(values) + "', values at smaller indexes must " + "be smaller than or equal to values at greater indexes");
                //</debug>
                filteredValue = previousFilteredValue;
            }

            filteredValues.push(filteredValue * -1);

            previousFilteredValue = filteredValue;
        }
        return filteredValues;
    },
    updateValue: function (newValue, oldValue) {
        var thumbs = this.getThumbs(),
            ln = newValue.length,
            i;

        this.setThumbsCount(ln);

        for (i = 0; i < ln; i++) {
            thumbs[i].getDraggable().setExtraConstraint(null).setOffset(newValue[i] * this.offsetValueRatio * -1);
        }

        for (i = 0; i < ln; i++) {
            this.refreshThumbConstraints(thumbs[i]);
        }
    },
    refreshThumbConstraints: function (thumb) {
        var allowThumbsOverlapping = this.getAllowThumbsOverlapping(),
            offsetX = thumb.getDraggable().getOffset().x,
            thumbs = this.getThumbs(),
            index = this.getThumbIndex(thumb),
            previousThumb = thumbs[index + 1],
            nextThumb = thumbs[index - 1],
            thumbWidth = this.thumbWidth;

        if (previousThumb) {
            previousThumb.getDraggable().addExtraConstraint({
                max: {
                    x: offsetX - ((allowThumbsOverlapping) ? 0 : thumbWidth)
                }
            });
        }

        if (nextThumb) {
            nextThumb.getDraggable().addExtraConstraint({
                min: {
                    x: offsetX + ((allowThumbsOverlapping) ? 0 : thumbWidth)
                }
            });
        }
    },
});





Ext.define('Ext.scroll.ScrollerRtl', {
    override: 'Ext.scroll.Scroller',
    snapToBoundary: function () {
        var position = this.position,
            minPosition = this.getMinPosition(),
            maxPosition = this.getMaxPosition(),
            minX = minPosition.x,
            minY = minPosition.y,
            maxX = maxPosition.x,
            maxY = maxPosition.y,
            tempMinX = minX,
            x = Math.round(position.x),
            y = Math.round(position.y);


        minX = -maxX;
        maxX = -tempMinX;
        if (x < minX) {
            x = minX;
        } else if (x > maxX) {
            x = maxX;
        }

        if (y < minY) {
            y = minY;
        } else if (y > maxY) {
            y = maxY;
        }

        this.scrollTo(x, y);
    },

    getAnimationEasing: function (axis) {

        if (!this.isAxisEnabled(axis)) {
            return null;
        }

        var currentPosition = this.position[axis],
            flickStartPosition = this.flickStartPosition[axis],
            flickStartTime = this.flickStartTime[axis],
            minPosition = this.getMinPosition()[axis],
            maxPosition = this.getMaxPosition()[axis],
            tmpMin = minPosition,
            maxAbsVelocity = this.getMaxAbsoluteVelocity(),
            boundValue = null,
            dragEndTime = this.dragEndTime,
            easing, velocity, duration;


        if (axis == "x") {


            minPosition = -maxPosition;
            maxPosition = -tmpMin;

        }
        if (currentPosition < minPosition) {
            boundValue = minPosition;
        } else if (currentPosition > maxPosition) {
            boundValue = maxPosition;
        }

        // Out of bound, to be pulled back
        if (boundValue !== null) {
            easing = this.getBounceEasing()[axis];
            easing.setConfig({
                startTime: dragEndTime,
                startValue: -currentPosition,
                endValue: -boundValue
            });

            return easing;
        }

        // Still within boundary, start deceleration
        duration = dragEndTime - flickStartTime;

        if (duration === 0) {
            return null;
        }

        velocity = (currentPosition - flickStartPosition) / (dragEndTime - flickStartTime);

        if (velocity === 0) {
            return null;
        }
        if (velocity < -maxAbsVelocity) {
            velocity = -maxAbsVelocity;
        } else if (velocity > maxAbsVelocity) {
            velocity = maxAbsVelocity;
        }

        easing = this.getMomentumEasing()[axis];
        if (axis == "x") {
            easing.setConfig({
                startTime: dragEndTime,
                startValue: -currentPosition,
                startVelocity: -velocity,
                minMomentumValue: 0,
                maxMomentumValue: -minPosition
            });
        } else {
            easing.setConfig({
                startTime: dragEndTime,
                startValue: -currentPosition,
                startVelocity: -velocity,
                minMomentumValue: -maxPosition,
                maxMomentumValue: 0
            });
        }

        return easing;
    },
    onAxisDrag: function (axis, delta) {
        if (!this.isAxisEnabled(axis)) {
            return;
        }

        var flickStartPosition = this.flickStartPosition,
            flickStartTime = this.flickStartTime,
            lastDragPosition = this.lastDragPosition,
            dragDirection = this.dragDirection,
            old = this.position[axis],
            min = this.getMinPosition()[axis],
            max = this.getMaxPosition()[axis],
            tmpMin = min,
            start = this.startPosition[axis],
            last = lastDragPosition[axis],
            current = start - delta,
            lastDirection = dragDirection[axis],
            restrictFactor = this.getOutOfBoundRestrictFactor(),
            startMomentumResetTime = this.getStartMomentumResetTime(),
            now = Ext.Date.now(),
            distance;
        if (axis == "x") {
            min = -max;
            max = -tmpMin;

            if (current < min) {
                distance = current - min;
                current = min + distance * restrictFactor;
            } else if (current > max) {
                current *= restrictFactor;
            }
        } else {
            if (current < min) {
                current *= restrictFactor;
            } else if (current > max) {
                distance = current - max;
                current = max + distance * restrictFactor;
            }
        }



        if (current > last) {
            dragDirection[axis] = 1;
        } else if (current < last) {
            dragDirection[axis] = -1;
        }

        if ((lastDirection !== 0 && (dragDirection[axis] !== lastDirection)) || (now - flickStartTime[axis]) > startMomentumResetTime) {
            flickStartPosition[axis] = old;
            flickStartTime[axis] = now;
        }

        lastDragPosition[axis] = current;
    }
});



Ext.define('Ext.scroll.indicator.DefaultRtl', {
    override: 'Ext.scroll.indicator.Default',
    updateValue: function (value) {
        var barLength = this.barLength,
            gapLength = this.gapLength,
            length = this.getLength(),
            axis = this.getAxis(),
            newLength, offset, extra;

        if (value <= 0) {
            offset = 0;
            this.updateLength(this.applyLength(length + value * barLength));
        } else if (value >= 1) {
            extra = Math.round((value - 1) * barLength);
            newLength = this.applyLength(length - extra);
            extra = length - newLength;
            this.updateLength(newLength);
            offset = gapLength + extra;
        } else {
            offset = gapLength * value;
        }
        if (axis == "x") {

            this.setOffset(offset * -1);
        } else {
            this.setOffset(offset);
        }

    }
})


Ext.define('Ext.scroll.indicator.ScrollPositionRtl', {
    override: 'Ext.scroll.indicator.ScrollPosition',
    updateValue: function (value) {
        var axis = this.getAxis();

        if (this.gapLength === 0) {
            if (value < 1) {
                value = value - 1;
            }
            if (axis == "x") {

                value *= -1
            }

            this.setOffset(this.barLength * value);

        } else {
            if (axis == "x") {

                //value*=-1
            }
            this.setOffset(this.gapLength * value);
        }
    },
    setLength: function (length) {
        var axis = this.getAxis(),
            scrollOffset = this.barLength,
            barDom = this.barElement.dom,
            element = this.element;

        this.callParent(arguments);

        if (axis === 'x') {
            scrollOffset *= -1;
            barDom.scrollRight = scrollOffset;
            element.setRight(scrollOffset);
        } else {
            barDom.scrollTop = scrollOffset;
            element.setTop(scrollOffset);
        }
    },
})

Ext.define('Ext.scroll.ViewRtl', {
    override: 'Ext.scroll.View',

    setIndicatorValue: function (axis, scrollerPosition) {
        if (!this.isAxisEnabled(axis)) {
            return this;
        }

        var scroller = this.getScroller(),
            scrollerMaxPosition = scroller.getMaxPosition()[axis],
            scrollerContainerSize = scroller.getContainerSize()[axis],
            value;
        if (axis === "x") {
            scrollerPosition *= -1
        }
        if (scrollerMaxPosition === 0) {
            value = scrollerPosition / scrollerContainerSize;

            if (scrollerPosition >= 0) {
                value += 1;
            }
        } else {
            if (scrollerPosition > scrollerMaxPosition) {
                value = 1 + ((scrollerPosition - scrollerMaxPosition) / scrollerContainerSize);
            } else if (scrollerPosition < 0) {
                value = scrollerPosition / scrollerContainerSize;
            } else {
                value = scrollerPosition / scrollerMaxPosition;
            }

        }
        this.getIndicators()[axis].setValue(value);
    },
});



Ext.define('Ext.TitleBarRtl', {
    override: 'Ext.TitleBar',
    refreshTitlePosition: function () {
        var titleElement = this.titleComponent.renderElement;

        titleElement.setWidth(null);
        titleElement.setLeft(null);

        //set the min/max width of the left button
        var leftBox = this.leftBox,
            leftButton = leftBox.down('button'),
            leftBoxWidth, maxButtonWidth;

        if (leftButton) {
            if (leftButton.getWidth() == null) {
                leftButton.renderElement.setWidth('auto');
            }

            leftBoxWidth = leftBox.renderElement.getWidth();
            maxButtonWidth = this.getMaxButtonWidth();

            if (leftBoxWidth > maxButtonWidth) {
                leftButton.renderElement.setWidth(maxButtonWidth);
            }
        }

        var spacerBox = this.spacer.renderElement.getPageBox(),
            titleBox = titleElement.getPageBox(),
            widthDiff = titleBox.width - spacerBox.width,
            titleLeft = titleBox.left,
            titleRight = titleBox.right,
            halfWidthDiff, leftDiff, rightDiff;

        if (widthDiff > 0) {
            titleElement.setWidth(spacerBox.width);
            halfWidthDiff = widthDiff / 2;
            titleLeft += halfWidthDiff;
            titleRight -= halfWidthDiff;
        }

        leftDiff = spacerBox.left - titleLeft;
        rightDiff = titleRight - spacerBox.right;

        if (leftDiff > 0) {
            titleElement.setRight(-leftDiff);
        } else if (rightDiff > 0) {
            titleElement.setRight(rightDiff);
        }

        titleElement.repaint();
    },
});

Ext.define('Ext.dataview.NestedListRtl', {
    override: 'Ext.dataview.NestedList',
    config: {

        /**
         * @cfg {String} layout
         * @hide
         * @accessor
         */
        layout: {
            type: 'card',
            animation: {
                type: 'slide',
                duration: 250,
                direction: 'right'
            }
        },
    }
});


Ext.define('Ext.navigation.ViewRtl', {
    override: 'Ext.navigation.View',
    config: {

        /**
         * @cfg {String} layout
         * @hide
         * @accessor
         */
        layout: {
            type: 'card',
            animation: {
                duration: 300,
                easing: 'ease-out',
                type: 'slide',
                direction: 'right'
            }
        }
    }
});


Ext.define('Ext.navigation.BarRtl', {
    override: 'Ext.navigation.Bar',
    config: {


        backButton: {
            align: 'left',
            ui: 'back',
            hidden: true
        }
    }
});


Ext.define('Ext.tab.PanelRtl', {
    override: 'Ext.tab.Panel',
    config: {

        /**
         * @cfg {String} layout
         * @hide
         * @accessor
         */
        layout: {
            type: 'card',
            animation: {
                type: 'slide',
                direction: 'right'
            }
        },
    }
});
