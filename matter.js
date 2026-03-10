document.getElementById("scrollBtn").addEventListener("click", function () {
  document.getElementById("about").scrollIntoView({ behavior: "smooth" });
});


const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

document.addEventListener("scroll", function () {
  const servicesSection = document.getElementById("services");
  const sketchPad = document.getElementById("sketchPad");

  // Get the position and dimensions of the services section
  const sectionTop = servicesSection.offsetTop;
  const sectionHeight = servicesSection.offsetHeight;
  const scrollPosition = window.scrollY + window.innerHeight;

  // Calculate 50% of the section's height
  const triggerPoint = sectionTop + sectionHeight * 0.5;

  // Check if the scroll position has reached the trigger point
  if (scrollPosition > triggerPoint) {
    sketchPad.classList.add("animate-sketch");
  }
});

var canvas = $('#wrapper-canvas').get(0);

var dimensions = {
  width: $(window).width(),
  height: $(window).height(),
};

Matter.use('matter-attractors');
Matter.use('matter-wrap');

function runMatter() {
  var Engine = Matter.Engine,
    Events = Matter.Events,
    Runner = Matter.Runner,
    Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Mouse = Matter.Mouse,
    Common = Matter.Common,
    Composite = Matter.Composite,
    Bodies = Matter.Bodies;

  var engine = Engine.create();

  engine.world.gravity.y = 0;
  engine.world.gravity.x = 0;
  engine.world.gravity.scale = 0.1;

  var render = Render.create({
      element: canvas,
      engine: engine,
      options: {
        showVelocity: false,
        width: dimensions.width,
        height: dimensions.height,
        wireframes: false,
        background: 'transparent',
      },
  });
  render.canvas.style.zIndex = "-1";

  var runner = Runner.create();

  var world = engine.world;
  world.gravity.scale = 0;

  var attractiveBody = Bodies.circle(
    render.options.width / 2,
    render.options.height / 2,
    Math.max(dimensions.width / 25, dimensions.height / 25) / 2,
    {
      render: {
        fillStyle: `#000`,
        strokeStyle: `#000`,
        lineWidth: 0,
      },
      isStatic: true,
      plugin: {
        attractors: [
          function (bodyA, bodyB) {
            return {
              x: (bodyA.position.x - bodyB.position.x) * 5e-7,
              y: (bodyA.position.y - bodyB.position.y) * 5e-7,
            };
          },
        ],
      },
    }
  );

  World.add(world, attractiveBody);

  for (var i = 0; i < 60; i += 1) {
    let x = Common.random(0, render.options.width);
    let y = Common.random(0, render.options.height);

    var smallBall = Bodies.circle(x, y, Common.random(3, 12), {
      mass: 0.1,
      friction: 5,
      frictionAir: 0.012,
      render: {
        fillStyle: `#27292d`,
        strokeStyle: `#000000`,
        lineWidth: 2,
      },
    });

    World.add(world, smallBall);
  }

  var mouse = Mouse.create(render.canvas);

  Events.on(engine, 'afterUpdate', function () {
    if (!mouse.position.x) return;
    Body.translate(attractiveBody, {
      x: (mouse.position.x - attractiveBody.position.x) * 0.05,
      y: (mouse.position.y - attractiveBody.position.y) * 0.05,
    });
  });

  const camera = {
    x: 0,
    y: 0,
    zoom: 1,
  };

  function applyCamera(render) {
    const context = render.context;
    context.save();
    context.translate(camera.x, camera.y);
    context.scale(camera.zoom, camera.zoom);
  }

  function resetCamera(render) {
    const context = render.context;
    context.restore();
  }

  let isDragging = false;
  let lastMousePosition = { x: 0, y: 0 };

  render.canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    lastMousePosition = { x: event.clientX, y: event.clientY };
  });

  render.canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const deltaX = event.clientX - lastMousePosition.x;
      const deltaY = event.clientY - lastMousePosition.y;

      camera.x += deltaX;
      camera.y += deltaY;

      lastMousePosition = { x: event.clientX, y: event.clientY };
    }
  });

  render.canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  const originalRender = Render.world;
  Render.world = function (render) {
    applyCamera(render);
    originalRender(render);
    resetCamera(render);
  };

  let data = {
    engine: engine,
    runner: runner,
    render: render,
    canvas: render.canvas,
    stop: function () {
      Matter.Render.stop(render);
      Matter.Runner.stop(runner);
    },
    play: function () {
      Matter.Runner.run(runner, engine);
      Matter.Render.run(render);
    },
  };

  Matter.Runner.run(runner, engine);
  Matter.Render.run(render);
  return data;
}

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

function setWindowSize() {
  let dimensions = {};
  dimensions.width = $(window).width();
  dimensions.height = $(window).height();

  m.render.canvas.width = $(window).width();
  m.render.canvas.height = $(window).height();
  return dimensions;
}

let m = runMatter();
setWindowSize();
$(window).resize(debounce(setWindowSize, 250));

