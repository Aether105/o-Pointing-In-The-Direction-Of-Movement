import { Application, Graphics, Text, Container } from 'https://cdn.jsdelivr.net/npm/pixi.js@8.x/dist/pixi.mjs';

(async () => {
    const app = new Application();

    await app.init({
        background: '#bcbec2',
        width: window.innerWidth,
        height: window.innerHeight,
    });

    document.body.appendChild(app.canvas);

    // --- Mover rectangle setup ---
    const moverWidth = 30;
    const moverHeight = 10;
    const mover = new Graphics()
        .rect(-moverWidth * 0.5, -moverHeight * 0.5, moverWidth, moverHeight) // centred rectangle.
        .fill(0x7f7f7f)
        .stroke({ width: 2, color: 0x000000 });

    mover.x = app.screen.width * 0.5;
    mover.y = app.screen.height * 0.5;
    app.stage.addChild(mover);

    // --- Physics variables ---
    let velocityX = 0;
    let velocityY = 0;
    let accelerationX = 0;
    let accelerationY = 0;
    const topSpeed = 6;

    let accelMultiplier = 0.5; // Adjustable with + / - buttons.
    let rotationSpeedFactor = 1.0; // Adjustable with its buttons.

    // Mouse tracking.
    let mouseX = app.screen.width * 0.5;
    let mouseY = app.screen.height * 0.5;

    app.stage.interactive = true;
    app.stage.hitArea = app.screen;
    app.stage.on("pointermove", (event) => {
        mouseX = event.global.x;
        mouseY = event.global.y;
    });

    // --- Button Creation Logic ---
    const buttonWidth = 100;
    const buttonHeight = 40;
    const buttonColour = 0x8c8e91;
    const buttonTextColour = 0xFFFFFF;
    const buttonHoverColour = 0xA29BFE;
    const buttonPressedColour = 0x5C4CD7; // Slightly darker when pressed.
    const buttonTextSize = 18;
    const buttonMargin = 15; // The space between the buttons.

    // Button Creation.
    function createButton(text, x, y, onClick){
        const button = new Container();
        button.x = x;
        button.y = y;
        button.interactive = true;
        button.cursor = 'pointer';

        const buttonRect = new Graphics().rect(0, 0, buttonWidth, buttonHeight, 8).fill(buttonColour);
        button.addChild(buttonRect);

        const buttonTextObj = new Text({
            text,
            style: {
                fill: buttonTextColour,
                fontSize: buttonTextSize,
                fontWeight: 'bold',
            },
        });
        buttonTextObj.anchor.set(0.5);
        buttonTextObj.x = buttonWidth * 0.5;
        buttonTextObj.y = buttonHeight * 0.5;
        button.addChild(buttonTextObj);

        button
            .on('pointerdown', () => {
                buttonRect.tint = buttonPressedColour;
                button.scale.set(0.95);
            })
            .on('pointerup', () => {
                buttonRect.tint = 0xFFFFFF;
                button.scale.set(1);
                onClick();
            })
            .on('pointerover', () => {
                
            })
            .on('pointerout', () => {
                buttonRect.tint = 0xFFFFFF;
                button.scale.set(1);
            });

        app.stage.addChild(button);
        return button;
    }

    // Grouping the buttons.
    const buttonGroup = new Container();
    buttonGroup.x = 20;
    buttonGroup.y = 60;
    app.stage.addChild(buttonGroup);

    buttonGroup.addChild(createButton("+ Accel", 0, 0, () => accelMultiplier += 0.2));
    buttonGroup.addChild(createButton("- Accel", buttonWidth + buttonMargin, 0, () => accelMultiplier = Math.max(0.1, accelMultiplier - 0.2)));
    buttonGroup.addChild(createButton("Faster Rot", 0, buttonHeight + buttonMargin, () => rotationSpeedFactor += 0.2));
    buttonGroup.addChild(createButton("Slower Rot", buttonWidth + buttonMargin, buttonHeight + buttonMargin, () => rotationSpeedFactor = Math.max(0.1, rotationSpeedFactor - 0.2)));

    // --- On-screen text ---
    const infoText = new Text({
        text: `Accel: ${accelMultiplier.toFixed(2)} | Rotation: ${rotationSpeedFactor.toFixed(2)}`,
        style: { fill: 0x000000, fontSize: 20 },
        x: 20,
        y: 20,
    });
    app.stage.addChild(infoText);

    // --- Animation loop ---
    app.ticker.add(() => {
        // Direction vector towards the mouse.
        let dirX = mouseX - mover.x;
        let dirY = mouseY - mover.y;

        const mag = Math.sqrt(dirX * dirX + dirY * dirY);
        if (mag !== 0) {
            dirX /= mag;
            dirY /= mag;
        }

        // Small acceleration towards the mouse.
        accelerationX = dirX * accelMultiplier;
        accelerationY = dirY * accelMultiplier;

        // Applies acceleration.
        velocityX += accelerationX;
        velocityY += accelerationY;

        // Limits the velocity.
        const vMag = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
        if (vMag > topSpeed) {
            velocityX = (velocityX / vMag) * topSpeed;
            velocityY = (velocityY / vMag) * topSpeed;
        }

        // Updates the position.
        mover.x += velocityX;
        mover.y += velocityY;

        // Rotation settings.
        const targetRotation = Math.atan2(velocityY, velocityX);
        mover.rotation = targetRotation * rotationSpeedFactor;

        // Wraps the edges.
        if (mover.x > app.screen.width) mover.x = 0;
        else if (mover.x < 0) mover.x = app.screen.width;

        if (mover.y > app.screen.height) mover.y = 0;
        else if (mover.y < 0) mover.y = app.screen.height;

        infoText.text = `Accel: ${accelMultiplier.toFixed(2)} | Rotation: ${rotationSpeedFactor.toFixed(2)}`;
    });
})();
