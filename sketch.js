var cellCols = 8;
var cellRows = 5;
var cells = [];

var count = 5000;
var pts = [];

var incX = 0.5;
var incY = 0.5;
var incT = 0.1;
var angC = 1;
var cellMag = 2;
var maxSpeed = 125;
var ptSize = 0.05;

var field;

function setup()
{
  frameRate(60);
  createCanvas(window.innerWidth, window.innerHeight);
  background(0);
  var cW = width / cellCols;
  var cH = height / cellRows;
  for(var x = 0; x < cellCols; x++)
  {
    for(var y = 0; y < cellRows; y++)
    {
      var dir = new Vec2D(cellMag, 0);
      dir.rot(map(noise(x * incX, y * incY, 0), 0, 1, -PI * angC, PI * angC));
      cells[x + y * cellCols] = new Cell(x * cW, y * cH, cW, cH, dir);
    }
  }
  for(var i = 0; i < count; i++)
  {
    pts[i] = new Point(random(width), random(height));
    pts[i].vel = new Vec2D(random(50) - random(50), random(50) - random(50));
  }
  field = new FlowField(cells, pts);
  field.update();
  stroke(255);
  strokeWeight(ptSize);
}

var time = 0;

function draw()
{
  for(var i = 0; i < count; i++)
  {
    pts[i].show();
    pts[i].update();
  }
  for(var i = 0; i < cellRows * cellCols; i++)
  {
    cells[i].update(time);
  }
  field.update();
  time += 1 / 60;
}

class Vec2D
{
  constructor(x, y)
  {
    this.x = x;
    this.y = y;
  }

  mag()
  {
    return sqrt(this.x * this.x + this.y * this.y);
  }

  normalize()
  {
    var mag = this.mag();
    this.x /= mag;
    this.y /= mag;
  }

  limit(mag)
  {
    if(this.mag() > mag)
    {
      this.normalize()
      this.x *= mag;
      this.y *= mag;
    }
  }

  add(vec)
  {
    this.x += vec.x;
    this.y += vec.y;
  }

  mult(val)
  {
    return new Vec2D(this.x * val, this.y * val);
  }

  zero()
  {
    this.x = 0;
    this.y = 0;
  }

  rot(angle)
  {
    var x = this.x;
    this.x = x * cos(angle) - this.y * sin(angle);
    this.y = x * sin(angle) + this.y * cos(angle);
  }
}

class Point
{
  constructor(x, y)
  {
    this.pos = new Vec2D(x, y);
    this.lpos = new Vec2D(x, y);
    this.acc = new Vec2D(0, 0);
    this.vel = new Vec2D(0, 0);
    this.max = maxSpeed;
  }

  update()
  {
    this.vel.add(this.acc);
    this.acc.zero();
    this.vel.limit(this.max);
    this.lpos.x = this.pos.x;
    this.lpos.y = this.pos.y;
    this.pos.add(this.vel.mult(1 / 60));
    if(this.pos.x < 0)
    {
      this.pos.x = width;
      this.lpos.x = width;
    }
    else if(this.pos.x > width)
    {
      this.pos.x = 0;
      this.lpos.x = 0;
    }
    if(this.pos.y < 0)
    {
      this.pos.y = height;
      this.lpos.y = height;
    }
    else if(this.pos.y > height)
    {
      this.pos.y = 0;
      this.lpos.y = 0;
    }
  }

  show()
  {
    line(this.lpos.x, this.lpos.y, this.pos.x, this.pos.y);
  }
}

class Cell
{
  constructor(x, y, w, h, dir)
  {
    this.pos = new Vec2D(x, y);
    this.w = w;
    this.h = h;
    this.dir = dir;
  }

  update(t)
  {
    var x = this.pos.x / this.w;
    var y = this.pos.y / this.h;
    this.dir = new Vec2D(cellMag, 0);
    this.dir.rot(map(noise(x * incX, y * incY, t * incT), 0, 1, -PI * angC,
    PI * angC));
  }

  show()
  {
    stroke(255);
    noFill();
    strokeWeight(1);
    rect(this.pos.x, this.pos.y, this.w, this.h);
    var x = this.pos.x + this.w / 2;
    var y = this.pos.y + this.h / 2;
    line(x, y, x + this.dir.x, y + this.dir.y);
  }
}

class FlowField
{
  constructor(cls, pts)
  {
    this.cells = cls;
    this.points = pts;
  }

  update()
  {
    for(var i = 0; i < this.points.length; i++)
    {
      var pt = this.points[i];
      var pX = pt.pos.x;
      var pY = pt.pos.y;
      for(var j = 0; j < this.cells.length; j++)
      {
        var cl = this.cells[j];
        var cX = cl.pos.x;
        var cY = cl.pos.y;
        if(pX >= cX && pY >= cY && pX <= cX + cl.w && pY <= cY + cl.h)
        {
          pt.acc.x = cl.dir.x;
          pt.acc.y = cl.dir.y;
          break;
        }
      }
    }
  }
}
