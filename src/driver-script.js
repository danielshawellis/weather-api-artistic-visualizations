const t = Symbol("GREEN_FLAG"),
  e = Symbol("KEY_PRESSED"),
  i = Symbol("BROADCAST"),
  s = Symbol("CLICKED"),
  n = Symbol("CLONE_START");
class r {
  constructor(t, e, i) {
    (this.trigger = t),
      void 0 === i
        ? ((this.options = {}), (this._script = e))
        : ((this.options = e), (this._script = i)),
      (this.done = !1),
      (this.stop = () => {});
  }
  matches(t, e) {
    if (this.trigger !== t) return !1;
    for (let t in e) if (this.options[t] !== e[t]) return !1;
    return !0;
  }
  start(t) {
    this.stop();
    const e = this._script.bind(t);
    return (
      (this.done = !1),
      (this._runningScript = e()),
      new Promise((t) => {
        this.stop = () => {
          (this.done = !0), t();
        };
      })
    );
  }
  step() {
    (this.done = this._runningScript.next().done), this.done && this.stop();
  }
  static get GREEN_FLAG() {
    return t;
  }
  static get KEY_PRESSED() {
    return e;
  }
  static get BROADCAST() {
    return i;
  }
  static get CLICKED() {
    return s;
  }
  static get CLONE_START() {
    return n;
  }
}
class o {
  static create() {
    const t = new Float32Array(9);
    return (t[0] = 1), (t[4] = 1), (t[8] = 1), t;
  }
  static translate(t, e, i, s) {
    const n = e[0],
      r = e[1],
      o = e[2],
      a = e[3],
      h = e[4],
      c = e[5],
      l = e[6],
      u = e[7],
      d = e[8];
    return (
      (t[0] = n),
      (t[1] = r),
      (t[2] = o),
      (t[3] = a),
      (t[4] = h),
      (t[5] = c),
      (t[6] = i * n + s * a + l),
      (t[7] = i * r + s * h + u),
      (t[8] = i * o + s * c + d),
      t
    );
  }
  static rotate(t, e, i) {
    const s = e[0],
      n = e[1],
      r = e[2],
      o = e[3],
      a = e[4],
      h = e[5],
      c = e[6],
      l = e[7],
      u = e[8],
      d = Math.sin(i),
      f = Math.cos(i);
    return (
      (t[0] = f * s + d * o),
      (t[1] = f * n + d * a),
      (t[2] = f * r + d * h),
      (t[3] = f * o - d * s),
      (t[4] = f * a - d * n),
      (t[5] = f * h - d * r),
      (t[6] = c),
      (t[7] = l),
      (t[8] = u),
      t
    );
  }
  static scale(t, e, i, s) {
    return (
      (t[0] = i * e[0]),
      (t[1] = i * e[1]),
      (t[2] = i * e[2]),
      (t[3] = s * e[3]),
      (t[4] = s * e[4]),
      (t[5] = s * e[5]),
      (t[6] = e[6]),
      (t[7] = e[7]),
      (t[8] = e[8]),
      t
    );
  }
}
class a {
  constructor(t) {
    (this.renderer = t), (this.gl = t.gl), (this.used = !0);
  }
  getTexture(t) {
    return null;
  }
  _makeTexture(t, e) {
    const i = this.gl,
      s = i.createTexture();
    return (
      i.bindTexture(i.TEXTURE_2D, s),
      i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_S, i.CLAMP_TO_EDGE),
      i.texParameteri(i.TEXTURE_2D, i.TEXTURE_WRAP_T, i.CLAMP_TO_EDGE),
      i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MIN_FILTER, e),
      i.texParameteri(i.TEXTURE_2D, i.TEXTURE_MAG_FILTER, e),
      t && i.texImage2D(i.TEXTURE_2D, 0, i.RGBA, i.RGBA, i.UNSIGNED_BYTE, t),
      s
    );
  }
  _setSizeFromImage(t) {
    t.complete
      ? ((this.width = t.naturalWidth), (this.height = t.naturalHeight))
      : t.addEventListener("load", () => {
          (this.width = t.naturalWidth), (this.height = t.naturalHeight);
        });
  }
  destroy() {}
}
const h = {
    vertex:
      "\nprecision mediump float;\n\nattribute vec2 a_position;\nuniform mat3 u_transform;\nuniform vec2 u_stageSize;\n\nvarying vec2 v_texCoord;\n\nvoid main() {\n  v_texCoord = vec2(a_position.x, 1.0 - a_position.y);\n  gl_Position = vec4((u_transform * vec3(a_position, 1.0)) / vec3(u_stageSize * 0.5, 1.0), 1.0);\n}\n",
    fragment:
      "\nprecision mediump float;\n\nconst float epsilon = 1e-3;\n\nuniform sampler2D u_texture;\nvarying vec2 v_texCoord;\n\n#ifdef EFFECT_color\nuniform float u_color;\n#endif\n\n#ifdef EFFECT_fisheye\nuniform float u_fisheye;\n#endif\n\n#ifdef EFFECT_whirl\nuniform float u_whirl;\n#endif\n\n#ifdef EFFECT_pixelate\nuniform float u_pixelate;\nuniform vec2 u_skinSize;\n#endif\n\n#ifdef EFFECT_mosaic\nuniform float u_mosaic;\n#endif\n\n#ifdef EFFECT_brightness\nuniform float u_brightness;\n#endif\n\n#ifdef EFFECT_ghost\nuniform float u_ghost;\n#endif\n\n#if defined(EFFECT_whirl) || defined(EFFECT_fisheye) || defined(EFFECT_pixelate)\nconst vec2 CENTER = vec2(0.5, 0.5);\n#endif\n\n#ifdef DRAW_MODE_COLOR_MASK\nuniform vec4 u_colorMask;\n\n// TODO: Scratch 2.0 and Scratch 3.0's CPU path check if the top 6 bits match,\n// which a tolerance of 3/255 should be equivalent to,\n// but Scratch's GPU path has a tolerance of 2/255.\nconst vec3 COLOR_MASK_TOLERANCE = vec3(3.0 / 255.0);\n#endif\n\n#ifdef EFFECT_color\n// Taken from http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl\nvec3 rgb2hsv(vec3 c)\n{\n  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n  vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);\n  vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);\n\n  float d = q.x - min(q.w, q.y);\n  float e = 1.0e-10;\n  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nvec3 hsv2rgb(vec3 c)\n{\n  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n}\n#endif\n\nvoid main() {\n  vec2 coord = v_texCoord;\n\n  #ifdef EFFECT_mosaic\n  {\n    float mosaicFactor = clamp(floor(abs(u_mosaic + 10.0) / 10.0 + 0.5), 1.0, 512.0);\n    coord = fract(coord * mosaicFactor);\n  }\n  #endif\n\n  #ifdef EFFECT_pixelate\n    vec2 pixSize = u_skinSize / (abs(u_pixelate) * 0.1);\n    coord = (floor(coord * pixSize) + CENTER) / pixSize;\n  #endif\n\n  #ifdef EFFECT_whirl\n  {\n    const float PI_OVER_180 = 0.017453292519943295;\n    vec2 offset = coord - CENTER;\n    float whirlFactor = max(1.0 - (length(offset) * 2.0), 0.0);\n    float whirl = (-u_whirl * PI_OVER_180) * whirlFactor * whirlFactor;\n    float s = sin(whirl);\n    float c = cos(whirl);\n    mat2 rotationMatrix = mat2(c, -s, s, c);\n    coord = rotationMatrix * offset + CENTER;\n  }\n  #endif\n\n  #ifdef EFFECT_fisheye\n  {\n    vec2 vec = (coord - CENTER) / CENTER;\n    float len = length(vec) + epsilon;\n    float factor = max(0.0, (u_fisheye + 100.0) / 100.0);\n    float r = pow(min(len, 1.0), factor) * max(1.0, len);\n    vec2 unit = vec / len;\n    coord = CENTER + (r * unit * CENTER);\n  }\n  #endif\n\n  vec4 color = texture2D(u_texture, coord);\n\n  #if defined(EFFECT_color) || defined(EFFECT_brightness)\n  // Un-premultiply color values by alpha channel\n  vec3 unmul = color.rgb / color.a;\n\n  #ifdef EFFECT_color\n  {\n    vec3 hsv = rgb2hsv(unmul);\n    const float minLightness = 0.11 / 2.0;\n    const float minSaturation = 0.09;\n\n    hsv.z = max(minLightness, hsv.z);\n    hsv.y = max(minSaturation, hsv.y);\n\n    hsv.x = mod(hsv.x + (u_color / 200.0), 1.0);\n\n    unmul = hsv2rgb(hsv);\n  }\n  #endif\n\n  #ifdef EFFECT_brightness\n  {\n    unmul = clamp(unmul + clamp(u_brightness * 0.01, -1.0, 1.0), 0.0, 1.0);\n  }\n  #endif\n\n  color = vec4(unmul * color.a, color.a);\n\n  #endif // defined(defined(EFFECT_color) || defined(EFFECT_brightness))\n\n  #ifdef DRAW_MODE_COLOR_MASK\n  vec3 diff = abs(u_colorMask.rgb - color.rgb);\n  if (any(greaterThan(diff, COLOR_MASK_TOLERANCE))) {\n    discard;\n  }\n  #endif\n\n  #ifdef EFFECT_ghost\n  color *= (1.0 - clamp(u_ghost * 0.01, 0.0, 1.0));\n  #endif\n\n  #ifdef DRAW_MODE_SILHOUETTE\n  if (color.a == 0.0) {\n    discard;\n  }\n  #endif\n\n  gl_FragColor = color;\n}\n",
  },
  c = {
    vertex:
      "\nprecision mediump float;\n\nattribute vec2 a_position;\n// The X and Y components of u_penPoints hold the first pen point. The Z and W components hold the difference between\n// the second pen point and the first. This is done because calculating the difference in the shader leads to floating-\n// point error when both points have large-ish coordinates.\nuniform vec4 u_penPoints;\nuniform vec2 u_penSkinSize;\nuniform float u_penSize;\nuniform float u_lineLength;\n\nvarying vec2 v_texCoord;\n\n// Add this to divisors to prevent division by 0, which results in NaNs propagating through calculations.\n// Smaller values can cause problems on some mobile devices.\nconst float epsilon = 1e-3;\n\nvoid main() {\n  // Calculate a rotated (\"tight\") bounding box around the two pen points.\n  // Yes, we're doing this 6 times (once per vertex), but on actual GPU hardware,\n  // it's still faster than doing it in JS combined with the cost of uniformMatrix4fv.\n\n  // Expand line bounds by sqrt(2) / 2 each side-- this ensures that all antialiased pixels\n  // fall within the quad, even at a 45-degree diagonal\n  vec2 position = a_position;\n  float expandedRadius = (u_penSize * 0.5) + 1.4142135623730951;\n\n  // The X coordinate increases along the length of the line. It's 0 at the center of the origin point\n  // and is in pixel-space (so at n pixels along the line, its value is n).\n  v_texCoord.x = mix(0.0, u_lineLength + (expandedRadius * 2.0), a_position.x) - expandedRadius;\n  // The Y coordinate is perpendicular to the line. It's also in pixel-space.\n  v_texCoord.y = ((a_position.y - 0.5) * expandedRadius) + 0.5;\n\n  position.x *= u_lineLength + (2.0 * expandedRadius);\n  position.y *= 2.0 * expandedRadius;\n\n  // 1. Center around first pen point\n  position -= expandedRadius;\n\n  // 2. Rotate quad to line angle\n  vec2 pointDiff = u_penPoints.zw;\n  // Ensure line has a nonzero length so it's rendered properly\n  // As long as either component is nonzero, the line length will be nonzero\n  // If the line is zero-length, give it a bit of horizontal length\n  pointDiff.x = (abs(pointDiff.x) < epsilon && abs(pointDiff.y) < epsilon) ? epsilon : pointDiff.x;\n  // The 'normalized' vector holds rotational values equivalent to sine/cosine\n  // We're applying the standard rotation matrix formula to the position to rotate the quad to the line angle\n  // pointDiff can hold large values so we must divide by u_lineLength instead of calling GLSL's normalize function:\n  // https://asawicki.info/news_1596_watch_out_for_reduced_precision_normalizelength_in_opengl_es\n  vec2 normalized = pointDiff / max(u_lineLength, epsilon);\n  position = mat2(normalized.x, normalized.y, -normalized.y, normalized.x) * position;\n\n  // 3. Translate quad\n  position += u_penPoints.xy;\n\n  // 4. Apply view transform\n  position *= 2.0 / u_penSkinSize;\n  gl_Position = vec4(position, 0, 1);\n}\n",
    fragment:
      '\nprecision mediump float;\n\nuniform sampler2D u_texture;\nuniform vec4 u_penPoints;\nuniform vec4 u_penColor;\nuniform float u_penSize;\nuniform float u_lineLength;\nvarying vec2 v_texCoord;\n\nvoid main() {\n  // Maaaaagic antialiased-line-with-round-caps shader.\n\n\t// "along-the-lineness". This increases parallel to the line.\n\t// It goes from negative before the start point, to 0.5 through the start to the end, then ramps up again\n\t// past the end point.\n\tfloat d = ((v_texCoord.x - clamp(v_texCoord.x, 0.0, u_lineLength)) * 0.5) + 0.5;\n\n\t// Distance from (0.5, 0.5) to (d, the perpendicular coordinate). When we\'re in the middle of the line,\n\t// d will be 0.5, so the distance will be 0 at points close to the line and will grow at points further from it.\n\t// For the "caps", d will ramp down/up, giving us rounding.\n\t// See https://www.youtube.com/watch?v=PMltMdi1Wzg for a rough outline of the technique used to round the lines.\n\tfloat line = distance(vec2(0.5), vec2(d, v_texCoord.y)) * 2.0;\n\t// Expand out the line by its thickness.\n\tline -= ((u_penSize - 1.0) * 0.5);\n\t// Because "distance to the center of the line" decreases the closer we get to the line, but we want more opacity\n\t// the closer we are to the line, invert it.\n\tgl_FragColor = u_penColor * clamp(1.0 - line, 0.0, 1.0);\n}\n',
  },
  l = [
    "color",
    "fisheye",
    "whirl",
    "pixelate",
    "mosaic",
    "brightness",
    "ghost",
  ],
  u = {};
for (let t = 0; t < l.length; t++) u[l[t]] = 1 << t;
class d {
  constructor(t, e) {
    (this.gl = t),
      (this.program = e),
      (this.uniforms = {}),
      (this.attribs = {});
    const i = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
    for (let s = 0; s < i; s++) {
      const { name: i } = t.getActiveUniform(e, s);
      this.uniforms[i] = t.getUniformLocation(e, i);
    }
    const s = t.getProgramParameter(e, t.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < s; i++) {
      const { name: s } = t.getActiveAttrib(e, i);
      this.attribs[s] = t.getAttribLocation(e, s);
    }
  }
}
class f {
  constructor(t) {
    (this.renderer = t), (this.gl = t.gl), (this._shaderCache = {});
    for (const t of Object.keys(f.DrawModes)) this._shaderCache[t] = new Map();
  }
  _createShader(t, e) {
    const i = this.gl,
      s = i.createShader(e);
    if (
      (i.shaderSource(s, t),
      i.compileShader(s),
      !i.getShaderParameter(s, i.COMPILE_STATUS))
    ) {
      throw "Could not compile WebGL program. \n" + i.getShaderInfoLog(s);
    }
    return s;
  }
  getShader(t, e = 0) {
    const i = this.gl,
      s = this._shaderCache[t];
    if (s.has(e)) return s.get(e);
    {
      let n;
      switch (t) {
        case f.DrawModes.DEFAULT:
        case f.DrawModes.SILHOUETTE:
        case f.DrawModes.COLOR_MASK:
          n = h;
          break;
        case f.DrawModes.PEN_LINE:
          n = c;
      }
      let r = `#define DRAW_MODE_${t}\n`;
      for (let t = 0; t < l.length; t++) {
        const i = l[t];
        0 != (e & u[i]) && (r += `#define EFFECT_${i}\n`);
      }
      const o = this._createShader(r + n.vertex, i.VERTEX_SHADER),
        a = this._createShader(r + n.fragment, i.FRAGMENT_SHADER),
        g = i.createProgram();
      if (
        (i.attachShader(g, o),
        i.attachShader(g, a),
        i.linkProgram(g),
        !i.getProgramParameter(g, i.LINK_STATUS))
      ) {
        const t = i.getProgramInfoLog(g);
        throw new Error("Could not compile WebGL program. \n" + t);
      }
      const _ = new d(i, g);
      return s.set(e, _), _;
    }
  }
}
f.DrawModes = {
  DEFAULT: "DEFAULT",
  SILHOUETTE: "SILHOUETTE",
  COLOR_MASK: "COLOR_MASK",
  PEN_LINE: "PEN_LINE",
};
class g extends a {
  constructor(t, e, i) {
    super(t), (this.width = e), (this.height = i);
    const s = t._createFramebufferInfo(e, i, this.gl.NEAREST);
    (this._framebufferInfo = s),
      (this._lastPenState = { size: 0, color: [0, 0, 0, 0] }),
      this.clear();
  }
  destroy() {
    const t = this.gl;
    t.deleteTexture(this._framebufferInfo.texture),
      t.deleteFramebuffer(this._framebufferInfo.framebuffer);
  }
  getTexture() {
    return this._framebufferInfo.texture;
  }
  penLine(t, e, i, s) {
    const n = this.renderer;
    n._setFramebuffer(this._framebufferInfo);
    const r = n._shaderManager.getShader(f.DrawModes.PEN_LINE),
      o = this.gl,
      a = n._setShader(r);
    a && o.uniform2f(r.uniforms.u_penSkinSize, this.width, this.height);
    const h = i.toRGBANormalized(),
      c = this._lastPenState.color;
    (a || h[0] !== c[0] || h[1] !== c[1] || h[2] !== c[2] || h[3] !== c[3]) &&
      ((this._lastPenState.color = h),
      o.uniform4f(
        r.uniforms.u_penColor,
        h[0] * h[3],
        h[1] * h[3],
        h[2] * h[3],
        h[3]
      )),
      (a || this._lastPenState.size !== s) &&
        ((this._lastPenState.size = s), o.uniform1f(r.uniforms.u_penSize, s));
    const l = e.x - t.x,
      u = e.y - t.y;
    o.uniform4f(r.uniforms.u_penPoints, t.x, t.y, l, u);
    const d = Math.sqrt(l * l + u * u);
    o.uniform1f(r.uniforms.u_lineLength, d), o.drawArrays(o.TRIANGLES, 0, 6);
  }
  clear() {
    this.renderer._setFramebuffer(this._framebufferInfo);
    const t = this.gl;
    t.clearColor(0, 0, 0, 0), t.clear(t.COLOR_BUFFER_BIT);
  }
}
class _ {
  constructor() {
    return (
      (this.left = -1 / 0),
      (this.right = 1 / 0),
      (this.bottom = -1 / 0),
      (this.top = 1 / 0),
      this
    );
  }
  static fromBounds(t, e, i, s, n) {
    return (
      n || (n = new _()),
      (n.left = t),
      (n.right = e),
      (n.bottom = i),
      (n.top = s),
      n
    );
  }
  static fromMatrix(t, e) {
    e || (e = new _());
    const i = t[0] / 2,
      s = t[3] / 2,
      n = Math.abs(i) + Math.abs(s),
      r = i + s + t[6],
      o = t[1] / 2,
      a = t[4] / 2,
      h = Math.abs(o) + Math.abs(a),
      c = o + a + t[7];
    return (
      (e.left = r - n),
      (e.right = r + n),
      (e.bottom = c - h),
      (e.top = c + h),
      e
    );
  }
  snapToInt() {
    return (
      (this.left = Math.floor(this.left)),
      (this.right = Math.ceil(this.right)),
      (this.bottom = Math.floor(this.bottom)),
      (this.top = Math.ceil(this.top)),
      this
    );
  }
  intersects(t) {
    return (
      this.left <= t.right &&
      t.left <= this.right &&
      this.top >= t.bottom &&
      t.top >= this.bottom
    );
  }
  containsPoint(t, e) {
    return (
      t >= this.left && t <= this.right && e >= this.bottom && e <= this.top
    );
  }
  clamp(t, e, i, s) {
    return (
      (this.left = Math.min(Math.max(this.left, t), e)),
      (this.right = Math.max(Math.min(this.right, e), t)),
      (this.bottom = Math.min(Math.max(this.bottom, i), s)),
      (this.top = Math.max(Math.min(this.top, s), i)),
      this
    );
  }
  static union(t, e, i = new _()) {
    return (
      (i.left = Math.min(t.left, e.left)),
      (i.right = Math.max(t.right, e.right)),
      (i.bottom = Math.min(t.bottom, e.bottom)),
      (i.top = Math.max(t.top, e.top)),
      i
    );
  }
  static intersection(t, e, i = new _()) {
    return (
      (i.left = Math.max(t.left, e.left)),
      (i.right = Math.min(t.right, e.right)),
      (i.bottom = Math.max(t.bottom, e.bottom)),
      (i.top = Math.min(t.top, e.top)),
      i
    );
  }
  get width() {
    return this.right - this.left;
  }
  get height() {
    return this.top - this.bottom;
  }
}
class m extends a {
  constructor(t, e) {
    super(t),
      (this._image = e),
      (this._texture = null),
      this._setSizeFromImage(e);
  }
  getTexture() {
    const t = this._image;
    return t.complete
      ? (null === this._texture &&
          (this._texture = super._makeTexture(t, this.gl.NEAREST)),
        this._texture)
      : null;
  }
  destroy() {
    null !== this._texture && this.gl.deleteTexture(this._texture);
  }
}
const p = 170,
  b = 4,
  E = 12,
  T = 12;
class x extends a {
  constructor(t, e) {
    super(t),
      (this._canvas = document.createElement("canvas")),
      (this._texture = this._makeTexture(null, this.gl.LINEAR)),
      (this._bubble = e),
      (this._flipped = !1),
      (this._rendered = !1),
      (this._renderedScale = 0),
      (this.width = 0),
      (this.height = 0),
      (this.offsetX = -b / 2),
      (this.offsetY = this.offsetX + T),
      this._renderBubble(this._bubble);
  }
  _restyleCanvas() {
    const t = this._canvas.getContext("2d");
    (t.font = "16px sans-serif"), (t.textBaseline = "hanging");
  }
  set flipped(t) {
    (this._flipped = t), (this._rendered = !1);
  }
  _renderBubble(t, e) {
    const i = this._canvas,
      s = i.getContext("2d");
    this._restyleCanvas();
    const { text: n, style: r } = t,
      o = s.measureText(n).width,
      a = p,
      h = E,
      c = Math.ceil(Math.min(o, a) + 2 * h),
      l = 10 + 2 * h;
    (this.width = c + b),
      (this.height = l + T + b),
      (i.width = this.width * e),
      (i.height = this.height * e),
      this._restyleCanvas();
    const u = b / 2,
      d = u;
    s.setTransform(e, 0, 0, e, 0, 0),
      (s.fillStyle = "#fff"),
      (s.strokeStyle = "#ccc"),
      (s.lineWidth = b),
      s.save(),
      this._flipped && (s.scale(-1, 1), s.translate(-this.width, 0)),
      ((t, e, i, n, r, o) => {
        r > i / 2 && (r = i / 2),
          r > n / 2 && (r = n / 2),
          r < 0 ||
            (s.beginPath(),
            s.moveTo(t + r, e),
            s.arcTo(t + i, e, t + i, e + n, r),
            s.arcTo(t + i, e + n, t + r, e + n, r),
            "say" === o
              ? (s.lineTo(Math.min(t + 3 * r, t + i - r), e + n),
                s.lineTo(t + r / 2, e + n + r),
                s.lineTo(t + r, e + n))
              : "think" === o &&
                s.ellipse(
                  t + 2.25 * r,
                  e + n,
                  (3 * r) / 4,
                  r / 2,
                  0,
                  0,
                  Math.PI
                ),
            s.arcTo(t, e + n, t, e, r),
            s.arcTo(t, e, t + i, e, r),
            s.closePath(),
            s.stroke(),
            s.fill(),
            "think" === o &&
              (s.beginPath(),
              s.ellipse(
                t + r,
                e + n + (3 * r) / 4,
                r / 3,
                r / 3,
                0,
                0,
                2 * Math.PI
              ),
              s.stroke(),
              s.fill()));
      })(u, d, c, l, T, r),
      s.restore(),
      (s.fillStyle = "#444"),
      s.fillText(n, u + h, d + h, a),
      (this._rendered = !0),
      (this._renderedScale = e);
  }
  getTexture(t) {
    if (!this._rendered || this._renderedScale !== t) {
      this._renderBubble(this._bubble, t);
      const e = this.gl;
      e.bindTexture(e.TEXTURE_2D, this._texture),
        e.texImage2D(
          e.TEXTURE_2D,
          0,
          e.RGBA,
          e.RGBA,
          e.UNSIGNED_BYTE,
          this._canvas
        );
    }
    return this._texture;
  }
  destroy() {
    this.gl.deleteTexture(this._texture);
  }
}
class y extends a {
  constructor(t, e) {
    super(t),
      (this._image = e),
      (this._canvas = document.createElement("canvas")),
      (this._maxTextureSize = t.gl.getParameter(t.gl.MAX_TEXTURE_SIZE)),
      this._setSizeFromImage(e),
      (this._mipmaps = new Map());
  }
  _createMipmap(t) {
    const e = 2 ** (t - 4),
      i = this._canvas,
      s = i.getContext("2d"),
      n = this._image;
    let r = n.naturalWidth * e,
      o = n.naturalHeight * e;
    (r = Math.round(Math.min(r, this._maxTextureSize))),
      (o = Math.round(Math.min(o, this._maxTextureSize))),
      0 !== r && 0 !== o
        ? ((i.width = r),
          (i.height = o),
          s.drawImage(n, 0, 0, r, o),
          this._mipmaps.set(t, this._makeTexture(i, this.gl.LINEAR)))
        : this._mipmaps.set(t, null);
  }
  getTexture(t) {
    if (!this._image.complete) return null;
    const e = Math.max(Math.ceil(Math.log2(t)) + 4, 0);
    return this._mipmaps.has(e) || this._createMipmap(e), this._mipmaps.get(e);
  }
  destroy() {
    for (const t of this._mipmaps.values()) this.gl.deleteTexture(t);
  }
}
class S {
  constructor(t, e, i = { x: 0, y: 0 }) {
    (this.name = t),
      (this.url = e),
      (this.img = new Image()),
      (this.img.crossOrigin = "Anonymous"),
      (this.img.src = this.url),
      (this.isBitmap = !this.url.match(/\.svg/)),
      (this.resolution = this.isBitmap ? 2 : 1),
      (this.center = i);
  }
  get width() {
    return this.img.naturalWidth;
  }
  get height() {
    return this.img.naturalHeight;
  }
}
class w {
  constructor(t) {
    (this._renderer = t), (this.gl = t.gl), (this._skins = new Map());
  }
  beginTrace() {
    this._skins.forEach((t) => {
      t.used = !1;
    });
  }
  endTrace() {
    this._skins.forEach((t, e) => {
      t.used || (t.destroy(), this._skins.delete(e));
    });
  }
  getSkin(t) {
    if (this._skins.has(t)) {
      const e = this._skins.get(t);
      return (e.used = !0), e;
    }
    {
      let e;
      return (
        (e =
          t instanceof S
            ? t.isBitmap
              ? new m(this._renderer, t.img)
              : new y(this._renderer, t.img)
            : new x(this._renderer, t)),
        this._skins.set(t, e),
        e
      );
    }
  }
}
const v = (t, e, i) => Math.max(e, Math.min(i, t));
function C(t, e, i) {
  (t /= 255), (e /= 255), (i /= 255);
  const s = Math.max(t, e, i),
    n = s - Math.min(t, e, i);
  let r = 0;
  0 === n ||
    (s === t
      ? (r = (((e - i) / n + 6) % 6) / 6)
      : s === e
      ? (r = (((i - t) / n + 2) % 6) / 6)
      : s === i && (r = (((t - e) / n + 4) % 6) / 6));
  let o = 0;
  return 0 !== s && (o = n / s), { h: 100 * r, s: 100 * o, v: 100 * s };
}
function R(t, e, i) {
  t = (t / 100) * 360;
  const s = (i /= 100) * (e /= 100),
    n = s * (1 - Math.abs(((t / 60) % 2) - 1)),
    r = i - s;
  let o = r,
    a = r,
    h = r;
  return (
    t < 60
      ? ((o += s), (a += n))
      : t < 120
      ? ((a += s), (o += n))
      : t < 180
      ? ((a += s), (h += n))
      : t < 240
      ? ((h += s), (a += n))
      : t < 300
      ? ((h += s), (o += n))
      : t < 360 && ((o += s), (h += n)),
    { r: 255 * o, g: 255 * a, b: 255 * h }
  );
}
class A {
  constructor(t = 0, e = 0, i = 0, s = 1) {
    (this.h = t), (this.s = e), (this.v = i), (this.a = s);
  }
  static rgb(t, e, i, s = 1) {
    const { h: n, s: r, v: o } = C(t, e, i);
    return new A(n, r, o, s);
  }
  static hsv(t, e, i, s = 1) {
    return new A(t, e, i, s);
  }
  static num(t) {
    const e = ((t = Number(t)) >> 24) & 255,
      i = (t >> 16) & 255,
      s = (t >> 8) & 255,
      n = 255 & t;
    return A.rgb(i, s, n, e > 0 ? e / 255 : 1);
  }
  get r() {
    return R(this.h, this.s, this.v).r;
  }
  set r(t) {
    this._setRGB(t, this.g, this.b);
  }
  get g() {
    return R(this.h, this.s, this.v).g;
  }
  set g(t) {
    this._setRGB(this.r, t, this.b);
  }
  get b() {
    return R(this.h, this.s, this.v).b;
  }
  set b(t) {
    this._setRGB(this.r, this.g, t);
  }
  get a() {
    return this._a;
  }
  set a(t) {
    this._a = v(t, 0, 1);
  }
  get h() {
    return this._h;
  }
  set h(t) {
    this._h = ((t % 100) + 100) % 100;
  }
  get s() {
    return this._s;
  }
  set s(t) {
    this._s = v(t, 0, 100);
  }
  get v() {
    return this._v;
  }
  set v(t) {
    this._v = v(t, 0, 100);
  }
  _setRGB(t, e, i) {
    (t = v(t, 0, 255)), (e = v(e, 0, 255)), (i = v(i, 0, 255));
    const { h: s, s: n, v: r } = C(t, e, i);
    (this.h = s), (this.s = n), (this.v = r);
  }
  toHexString(t = !1) {
    const e = (t) => {
      let e = (t = v(Math.round(t), 0, 255)).toString(16);
      return 1 === e.length && (e = "0" + e), e;
    };
    let i = "#" + [this.r, this.g, this.b].map(e).join("");
    return (t || 1 !== this.a) && (i += e(255 * this.a)), i;
  }
  toRGBString(t = !1) {
    const e = [this.r, this.g, this.b].map(Math.round);
    return t || 1 !== this.a
      ? `rgba(${e.join(", ")}, ${this.a})`
      : `rgb(${e.join(", ")})`;
  }
  toRGBA() {
    const t = R(this._h, this._s, this._v);
    return [t.r, t.g, t.b, 255 * this._a];
  }
  toRGBANormalized() {
    const t = R(this._h, this._s, this._v);
    return [t.r / 255, t.g / 255, t.b / 255, this._a];
  }
  toString() {
    return this.toRGBString();
  }
}
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2013-2019 Truman Kilen, Nathan Dinsmore, and Adroitwhiz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */ const M = [
    7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 19, 21, 23, 25, 28, 31, 34, 37, 41, 45,
    50, 55, 60, 66, 73, 80, 88, 97, 107, 118, 130, 143, 157, 173, 190, 209, 230,
    253, 279, 307, 337, 371, 408, 449, 494, 544, 598, 658, 724, 796, 876, 963,
    1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066, 2272, 2499, 2749, 3024,
    3327, 3660, 4026, 4428, 4871, 5358, 5894, 6484, 7132, 7845, 8630, 9493,
    10442, 11487, 12635, 13899, 15289, 16818, 18500, 20350, 22385, 24623, 27086,
    29794, 32767,
  ],
  D = [-1, -1, -1, -1, 2, 4, 6, 8, -1, -1, -1, -1, 2, 4, 6, 8];
function L(t, e) {
  const i = new DataView(t);
  if (1380533830 !== i.getUint32(0) || 1463899717 !== i.getUint32(8))
    return Promise.reject(new Error("Unrecognized audio format"));
  const s = {},
    n = i.byteLength - 8;
  let r = 12;
  for (; r < n; )
    (s[
      String.fromCharCode(
        i.getUint8(r),
        i.getUint8(r + 1),
        i.getUint8(r + 2),
        i.getUint8(r + 3)
      )
    ] = r),
      (r += 8 + i.getUint32(r + 4, !0));
  const o = i.getUint16(20, !0),
    a = i.getUint32(24, !0);
  if (17 === o) {
    const t = (i.getUint16(38, !0) - 1) / 2 + 4,
      n = i.getUint32(s.fact + 8, !0),
      r = e.createBuffer(1, n, a),
      o = r.getChannelData(0);
    let h,
      c,
      l,
      u,
      d = 0,
      f = -1;
    const g = s.data + 8;
    let _ = g,
      m = 0;
    for (;;)
      if ((_ - g) % t == 0 && f < 0) {
        if (_ >= i.byteLength) break;
        (h = i.getInt16(_, !0)),
          (_ += 2),
          (d = i.getUint8(_)),
          (_ += 1),
          _++,
          d > 88 && (d = 88),
          (o[m++] = h / 32767);
      } else {
        if (f < 0) {
          if (_ >= i.byteLength) break;
          (f = i.getUint8(_)), (_ += 1), (l = 15 & f);
        } else (l = (f >> 4) & 15), (f = -1);
        (c = M[d]),
          (u = 0),
          4 & l && (u += c),
          2 & l && (u += c >> 1),
          1 & l && (u += c >> 2),
          (u += c >> 3),
          (d += D[l]),
          d > 88 && (d = 88),
          d < 0 && (d = 0),
          (h += 8 & l ? -u : u),
          h > 32767 && (h = 32767),
          h < -32768 && (h = -32768),
          (o[m++] = h / 32768);
      }
    return Promise.resolve(r);
  }
  return Promise.reject(new Error("Unrecognized WAV format " + o));
}
function k(t) {
  const e = new DataView(t).getUint16(20, !0);
  return (
    (function (t) {
      const e = new DataView(t);
      return 1380533830 === e.getUint32(0) && 1463899717 === e.getUint32(8);
    })(t) && 17 === e
  );
}
class F {
  constructor(t, e) {
    (this.name = t),
      (this.url = e),
      (this.audioBuffer = null),
      (this.source = null),
      (this.playbackRate = 1),
      this.downloadMyAudioBuffer();
  }
  get duration() {
    return this.audioBuffer.duration;
  }
  *start() {
    let t = !1,
      e = !0;
    if ((this._markDone && this._markDone(), this.audioBuffer))
      this.playMyAudioBuffer(), (t = !0);
    else {
      const i = this._doneDownloading;
      this._doneDownloading = (s) => {
        s
          ? (e = !1)
          : (this.playMyAudioBuffer(), (t = !0), delete this._doneDownloading),
          i && i(!0);
      };
    }
    for (; !t && e; ) yield;
    return e;
  }
  *playUntilDone() {
    let t = !0;
    const e = yield* this.start();
    if (
      this.audioBuffer &&
      (this.source.addEventListener("ended", () => {
        (t = !1), delete this._markDone;
      }),
      e)
    )
      for (
        this._markDone = () => {
          (t = !1), delete this._markDone;
        };
        t;

      )
        yield;
  }
  stop() {
    this._markDone && this._markDone(),
      this.source && (this.source.disconnect(), (this.source = null));
  }
  downloadMyAudioBuffer() {
    return fetch(this.url)
      .then((t) => t.arrayBuffer())
      .then((t) =>
        k(t)
          ? L(t, F.audioContext).catch(
              (t) => (
                console.warn(
                  `Failed to load sound "${this.name}" - will not play:\n` + t
                ),
                null
              )
            )
          : new Promise((e, i) => {
              F.audioContext.decodeAudioData(t, e, i);
            })
      )
      .then(
        (t) => (
          (this.audioBuffer = t),
          this._doneDownloading && this._doneDownloading(),
          t
        )
      );
  }
  playMyAudioBuffer() {
    this.audioBuffer &&
      (this.source && this.source.disconnect(),
      (this.source = F.audioContext.createBufferSource()),
      (this.source.buffer = this.audioBuffer),
      (this.source.playbackRate.value = this.playbackRate),
      this.target && this.source.connect(this.target),
      this.source.start(F.audioContext.currentTime));
  }
  connect(t) {
    t !== this.target &&
      ((this.target = t),
      this.source &&
        (this.source.disconnect(), this.source.connect(this.target)));
  }
  setPlaybackRate(t) {
    (this.playbackRate = t),
      this.source && (this.source.playbackRate.value = t);
  }
  isConnectedTo(t) {
    return this.target === t;
  }
  static get audioContext() {
    return this._setupAudioContext(), this._audioContext;
  }
  static _setupAudioContext() {
    if (!this._audioContext) {
      const t = window.AudioContext || window.webkitAudioContext;
      this._audioContext = new t();
    }
  }
  static decodeADPCMAudio(t) {
    return L(t, this.audioContext);
  }
}
class N {
  constructor(t) {
    const { getNonPatchSoundList: e } = t;
    (this.config = t),
      (this.inputNode = F.audioContext.createGain()),
      (this.effectNodes = {}),
      this.resetToInitial(),
      (this.getNonPatchSoundList = e);
  }
  resetToInitial() {
    const t = N.getInitialEffectValues();
    if (this.effectValues)
      for (const [t, e] of Object.entries(N.getInitialEffectValues()))
        !1 !== N.getEffectDescriptor(t).reset && this.setEffectValue(t, e);
    else this.effectValues = t;
  }
  updateAudioEffect(t) {
    const e = N.getEffectDescriptor(t);
    if (!e) return;
    const i = this.effectValues[t];
    if (e.isPatch) {
      let s = e;
      do {
        s = N.getNextEffectDescriptor(s.name);
      } while (s && !this.effectNodes[s.name]);
      let n = e;
      do {
        n = N.getPreviousEffectDescriptor(n.name);
      } while (n && !this.effectNodes[n.name]);
      s && (s = this.effectNodes[s.name]),
        n && (s = this.effectNodes[n.name]),
        n || (n = { output: this.inputNode }),
        !s && this.target && (s = { input: this.target });
      let r = this.effectNodes[e.name];
      if (
        (r ||
          i === e.initial ||
          ((r = e.makeNodes()),
          (this.effectNodes[e.name] = r),
          n.output.disconnect(),
          n.output.connect(r.input),
          s && r.output.connect(s.input)),
        i === e.initial)
      ) {
        if (r) {
          for (const t of new Set(Object.values(r))) t.disconnect();
          s && n.output.connect(s.input), delete this.effectNodes[t];
        }
      } else e.set(i, r);
    } else for (const t of this.getNonPatchSoundList()) e.set(i, t);
  }
  connect(t) {
    this.target = t;
    let e = N.getLastEffectDescriptor();
    do {
      e = N.getPreviousEffectDescriptor(e.name);
    } while (e && !this.effectNodes[e.name]);
    (e = e ? this.effectNodes[e.name] : { output: this.inputNode }),
      e.output.disconnect(),
      e.output.connect(t);
  }
  setEffectValue(t, e) {
    (e = Number(e)),
      t in this.effectValues &&
        !isNaN(e) &&
        e !== this.effectValues[t] &&
        ((this.effectValues[t] = e),
        this.clampEffectValue(t),
        this.updateAudioEffect(t));
  }
  changeEffectValue(t, e) {
    (e = Number(e)),
      t in this.effectValues &&
        !isNaN(e) &&
        0 !== e &&
        ((this.effectValues[t] += e),
        this.clampEffectValue(t),
        this.updateAudioEffect(t));
  }
  clampEffectValue(t) {
    const e = N.getEffectDescriptor(t);
    let i = this.effectValues[t];
    "minimum" in e && i < e.minimum
      ? (i = e.minimum)
      : "maximum" in e && i > e.maximum && (i = e.maximum),
      (this.effectValues[t] = i);
  }
  getEffectValue(t) {
    return this.effectValues[t] || 0;
  }
  clone(t) {
    const e = new N(Object.assign({}, this.config, t));
    for (const [t, i] of Object.entries(this.effectValues)) {
      N.getEffectDescriptor(t).resetOnClone || e.setEffectValue(t, i);
    }
    return e.connect(this.target), e;
  }
  applyToSound(t) {
    t.connect(this.inputNode);
    for (const [e, i] of Object.entries(this.effectValues)) {
      const s = N.getEffectDescriptor(e);
      s.isPatch || s.set(i, t);
    }
  }
  isTargetOf(t) {
    return t.isConnectedTo(this.inputNode);
  }
  static getInitialEffectValues() {
    const t = {};
    for (const { name: e, initial: i } of this.effectDescriptors) t[e] = i;
    return t;
  }
  static getEffectDescriptor(t) {
    return this.effectDescriptors.find((e) => e.name === t);
  }
  static getFirstEffectDescriptor() {
    return this.effectDescriptors[0];
  }
  static getLastEffectDescriptor() {
    return this.effectDescriptors[this.effectDescriptors.length - 1];
  }
  static getNextEffectDescriptor(t) {
    return this.effectDescriptors
      .slice(1)
      .find((e, i) => this.effectDescriptors[i].name === t);
  }
  static getPreviousEffectDescriptor(t) {
    return this.effectDescriptors
      .slice(0, -1)
      .find((e, i) => this.effectDescriptors[i + 1].name === t);
  }
}
(N.decayDuration = 0.025),
  (N.decayWait = 0.05),
  (N.effectDescriptors = [
    {
      name: "pan",
      initial: 0,
      minimum: -100,
      maximum: 100,
      isPatch: !0,
      makeNodes() {
        const t = F.audioContext,
          e = t.createGain(),
          i = t.createGain(),
          s = t.createGain(),
          n = t.createChannelMerger(2),
          r = n;
        return (
          e.connect(i),
          e.connect(s),
          i.connect(n, 0, 0),
          s.connect(n, 0, 1),
          { input: e, output: r, leftGain: i, rightGain: s, channelMerger: n }
        );
      },
      set(t, { input: e, output: i, leftGain: s, rightGain: n }) {
        const r = (t + 100) / 200,
          o = Math.cos((r * Math.PI) / 2),
          a = Math.sin((r * Math.PI) / 2),
          { currentTime: h } = F.audioContext,
          { decayWait: c, decayDuration: l } = N;
        s.gain.setTargetAtTime(o, h + c, l),
          n.gain.setTargetAtTime(a, h + c, l);
      },
    },
    {
      name: "pitch",
      initial: 0,
      isPatch: !1,
      set(t, e) {
        const i = t / 10,
          s = Math.pow(2, i / 12);
        e.setPlaybackRate(s);
      },
    },
    {
      name: "volume",
      initial: 100,
      minimum: 0,
      maximum: 100,
      resetOnStart: !1,
      resetOnClone: !0,
      isPatch: !0,
      makeNodes() {
        const t = F.audioContext.createGain();
        return { input: t, output: t, node: t };
      },
      set(t, { node: e }) {
        e.gain.linearRampToValueAtTime(
          t / 100,
          F.audioContext.currentTime + N.decayDuration
        );
      },
    },
  ]);
class B {
  constructor(t) {
    this.effectChain = t;
    for (const { name: e } of N.effectDescriptors)
      Object.defineProperty(this, e, {
        get: () => t.getEffectValue(e),
        set: (i) => t.setEffectValue(e, i),
      });
  }
  clear() {
    this.effectChain.resetToInitial();
  }
}
class P {
  constructor() {
    (this._bitmask = 0), (this._effectValues = {});
    for (let t = 0; t < l.length; t++) {
      const e = l[t];
      (this._effectValues[e] = 0),
        Object.defineProperty(this, e, {
          get: () => this._effectValues[e],
          set: (i) => {
            (this._effectValues[e] = i),
              (this._bitmask =
                0 === i ? this._bitmask & ~(1 << t) : this._bitmask | (1 << t));
          },
        });
    }
  }
  _clone() {
    const t = new P();
    for (const e of Object.keys(this._effectValues)) t[e] = this[e];
    return t;
  }
  clear() {
    for (const t of Object.keys(this._effectValues)) this._effectValues[t] = 0;
    this._bitmask = 0;
  }
}
class O {
  constructor(t, e = {}) {
    this._project = null;
    const { costumeNumber: i, layerOrder: s = 0 } = t;
    (this._costumeNumber = i),
      (this._layerOrder = s),
      (this.triggers = []),
      (this.watchers = {}),
      (this.costumes = []),
      (this.sounds = []),
      (this.effectChain = new N({
        getNonPatchSoundList: this.getSoundsPlayedByMe.bind(this),
      })),
      this.effectChain.connect(F.audioContext.destination),
      (this.effects = new P()),
      (this.audioEffects = new B(this.effectChain)),
      (this._vars = e);
  }
  getSoundsPlayedByMe() {
    return this.sounds.filter((t) => this.effectChain.isTargetOf(t));
  }
  get stage() {
    return this._project.stage;
  }
  get sprites() {
    return this._project.sprites;
  }
  get vars() {
    return this._vars;
  }
  get costumeNumber() {
    return this._costumeNumber;
  }
  set costumeNumber(t) {
    this._costumeNumber = ((t - 1) % this.costumes.length) + 1;
  }
  set costume(t) {
    if (
      ("number" == typeof t && (this.costumeNumber = t), "string" == typeof t)
    ) {
      const e = this.costumes.findIndex((e) => e.name === t);
      if (e > -1) this.costumeNumber = e + 1;
      else
        switch (t) {
          case "next costume":
          case "next backdrop":
            this.costumeNumber = this.costumeNumber + 1;
            break;
          case "previous costume":
          case "previous backdrop":
            this.costumeNumber = this.costumeNumber - 1;
            break;
          case "random costume":
          case "random backdrop": {
            const t = 1,
              e = this.costumes.length,
              i = this.costumeNumber,
              s = e - t;
            let n = t + Math.floor(Math.random() * s);
            n >= i && n++, (this.costumeNumber = n);
            break;
          }
          default:
            isNaN(t) ||
              0 === t.trim().length ||
              (this.costumeNumber = Number(t));
        }
    }
  }
  get costume() {
    return this.costumes[this.costumeNumber - 1];
  }
  moveAhead(t = 1 / 0) {
    "number" == typeof t
      ? this._project.changeSpriteLayer(this, t)
      : this._project.changeSpriteLayer(this, 1, t);
  }
  moveBehind(t = 1 / 0) {
    "number" == typeof t
      ? this._project.changeSpriteLayer(this, -t)
      : this._project.changeSpriteLayer(this, -1, t);
  }
  degToRad(t) {
    return (t * Math.PI) / 180;
  }
  radToDeg(t) {
    return (180 * t) / Math.PI;
  }
  degToScratch(t) {
    return 90 - t;
  }
  scratchToDeg(t) {
    return 90 - t;
  }
  radToScratch(t) {
    return this.degToScratch(this.radToDeg(t));
  }
  scratchToRad(t) {
    return this.degToRad(this.scratchToDeg(t));
  }
  normalizeDeg(t) {
    return ((((t + 180) % 360) + 360) % 360) - 180;
  }
  warp(t) {
    const e = t.bind(this);
    return (...t) => {
      const i = e(...t);
      for (; !i.next().done; );
    };
  }
  random(t, e) {
    const i = Math.min(t, e),
      s = Math.max(t, e);
    return i % 1 == 0 && s % 1 == 0
      ? Math.floor(Math.random() * (s - i + 1)) + i
      : Math.random() * (s - i) + i;
  }
  *wait(t) {
    let e = new Date();
    for (e.setMilliseconds(e.getMilliseconds() + 1e3 * t); new Date() < e; )
      yield;
  }
  get mouse() {
    return this._project.input.mouse;
  }
  keyPressed(t) {
    return this._project.input.keyPressed(t);
  }
  get timer() {
    return (new Date() - this._project.timerStart) / 1e3;
  }
  restartTimer() {
    this._project.restartTimer();
  }
  *startSound(t) {
    const e = this.getSound(t);
    e && (this.effectChain.applyToSound(e), yield* e.start());
  }
  *playSoundUntilDone(t) {
    const e = this.getSound(t);
    e &&
      (e.connect(this.effectChain.inputNode),
      this.effectChain.applyToSound(e),
      yield* e.playUntilDone());
  }
  getSound(t) {
    return "number" == typeof t
      ? this.sounds[(t - 1) % this.sounds.length]
      : this.sounds.find((e) => e.name === t);
  }
  stopAllSounds() {
    this._project.stopAllSounds();
  }
  stopAllOfMySounds() {
    for (const t of this.sounds) t.stop();
  }
  broadcast(t) {
    return this._project.fireTrigger(r.BROADCAST, { name: t });
  }
  *broadcastAndWait(t) {
    let e = !0;
    for (
      this.broadcast(t).then(() => {
        e = !1;
      });
      e;

    )
      yield;
  }
  clearPen() {
    this._project.renderer.clearPen();
  }
  *askAndWait(t) {
    this._speechBubble && this.say(null);
    let e = !1;
    for (
      this._project.askAndWait(t).then(() => {
        e = !0;
      });
      !e;

    )
      yield;
  }
  get answer() {
    return this._project.answer;
  }
}
class I extends O {
  constructor(t, ...e) {
    super(t, ...e);
    const {
      x: i,
      y: s,
      direction: n,
      rotationStyle: r,
      costumeNumber: o,
      size: a,
      visible: h,
      penDown: c,
      penSize: l,
      penColor: u,
    } = t;
    (this._x = i),
      (this._y = s),
      (this._direction = n),
      (this.rotationStyle = r || I.RotationStyle.ALL_AROUND),
      (this._costumeNumber = o),
      (this.size = a),
      (this.visible = h),
      (this.parent = null),
      (this.clones = []),
      (this._penDown = c || !1),
      (this.penSize = l || 1),
      (this._penColor = u || A.rgb(0, 0, 0)),
      (this._speechBubble = { text: "", style: "say", timeout: null });
  }
  createClone() {
    const t = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    (t._project = this._project),
      (t.triggers = this.triggers.map(
        (t) => new r(t.trigger, t.options, t._script)
      )),
      (t.costumes = this.costumes),
      (t.sounds = this.sounds),
      (t._vars = Object.assign({}, this._vars)),
      (t._speechBubble = { text: "", style: "say", timeout: null }),
      (t.effects = this.effects._clone());
    let e = this;
    for (; e.parent; ) e = e.parent;
    (t.effectChain = e.effectChain.clone({
      getNonPatchSoundList: t.getSoundsPlayedByMe.bind(t),
    })),
      (t.audioEffects = new B(t.effectChain)),
      (t.clones = []),
      (t.parent = this),
      this.clones.push(t);
    const i = t.triggers.filter((t) => t.matches(r.CLONE_START));
    this._project._startTriggers(i.map((e) => ({ trigger: e, target: t })));
  }
  deleteThisClone() {
    null !== this.parent &&
      ((this.parent.clones = this.parent.clones.filter((t) => t !== this)),
      (this._project.runningTriggers = this._project.runningTriggers.filter(
        ({ target: t }) => t !== this
      )));
  }
  andClones() {
    return [this, ...this.clones.flatMap((t) => t.andClones())];
  }
  get direction() {
    return this._direction;
  }
  set direction(t) {
    this._direction = this.normalizeDeg(t);
  }
  goto(t, e) {
    (t === this.x && e === this.y) ||
      (this.penDown &&
        this._project.renderer.penLine(
          { x: this._x, y: this._y },
          { x: t, y: e },
          this._penColor,
          this.penSize
        ),
      (this._x = t),
      (this._y = e));
  }
  get x() {
    return this._x;
  }
  set x(t) {
    this.goto(t, this._y);
  }
  get y() {
    return this._y;
  }
  set y(t) {
    this.goto(this._x, t);
  }
  move(t) {
    const e = this.scratchToRad(this.direction);
    this.goto(this._x + t * Math.cos(e), this._y + t * Math.sin(e));
  }
  *glide(t, e, i) {
    const s = (t, e, i) => t + (e - t) * i,
      n = new Date(),
      r = this._x,
      o = this._y;
    let a;
    do {
      (a = (new Date() - n) / (1e3 * t)),
        this.goto(s(r, e, a), s(o, i, a)),
        yield;
    } while (a < 1);
  }
  get penDown() {
    return this._penDown;
  }
  set penDown(t) {
    t &&
      this._project.renderer.penLine(
        { x: this.x, y: this.y },
        { x: this.x, y: this.y },
        this._penColor,
        this.penSize
      ),
      (this._penDown = t);
  }
  get penColor() {
    return this._penColor;
  }
  set penColor(t) {
    t instanceof A
      ? (this._penColor = t)
      : console.error(
          t + " is not a valid penColor. Try using the Color class!"
        );
  }
  stamp() {
    this._project.renderer.stamp(this);
  }
  touching(t, e = !1) {
    if ("string" == typeof t)
      switch (t) {
        case "mouse":
          return this._project.renderer.checkPointCollision(
            this,
            { x: this.mouse.x, y: this.mouse.y },
            e
          );
        default:
          return (
            console.error(
              `Cannot find target "${t}" in "touching". Did you mean to pass a sprite class instead?`
            ),
            !1
          );
      }
    else if (t instanceof A)
      return this._project.renderer.checkColorCollision(this, t);
    return this._project.renderer.checkSpriteCollision(this, t, e);
  }
  colorTouching(t, e) {
    return "string" == typeof e
      ? (console.error(
          `Cannot find target "${e}" in "touchingColor". Did you mean to pass a sprite class instead?`
        ),
        !1)
      : "string" == typeof t
      ? (console.error(
          `Cannot find color "${t}" in "touchingColor". Did you mean to pass a Color instance instead?`
        ),
        !1)
      : e instanceof A
      ? this._project.renderer.checkColorCollision(this, e, t)
      : this._project.renderer.checkSpriteCollision(this, e, !1, t);
  }
  say(t) {
    clearTimeout(this._speechBubble.timeout),
      (this._speechBubble = { text: String(t), style: "say", timeout: null });
  }
  think(t) {
    clearTimeout(this._speechBubble.timeout),
      (this._speechBubble = { text: String(t), style: "think", timeout: null });
  }
  *sayAndWait(t, e) {
    clearTimeout(this._speechBubble.timeout);
    let i = !1;
    const s = setTimeout(() => {
      (this._speechBubble.text = ""), (this.timeout = null), (i = !0);
    }, 1e3 * e);
    for (this._speechBubble = { text: t, style: "say", timeout: s }; !i; )
      yield;
  }
  *thinkAndWait(t, e) {
    clearTimeout(this._speechBubble.timeout);
    let i = !1;
    const s = setTimeout(() => {
      (this._speechBubble.text = ""), (this.timeout = null), (i = !0);
    }, 1e3 * e);
    for (this._speechBubble = { text: t, style: "think", timeout: s }; !i; )
      yield;
  }
}
I.RotationStyle = Object.freeze({
  ALL_AROUND: Symbol("ALL_AROUND"),
  LEFT_RIGHT: Symbol("LEFT_RIGHT"),
  DONT_ROTATE: Symbol("DONT_ROTATE"),
});
class U extends O {
  constructor(t, ...e) {
    super(t, ...e),
      Object.defineProperties(this, {
        width: { value: t.width || 480, enumerable: !0 },
        height: { value: t.height || 360, enumerable: !0 },
      }),
      (this.name = "Stage"),
      (this.__counter = 0);
  }
}
class z {
  constructor(t, e) {
    const i = t.stage.width,
      s = t.stage.height;
    (this.project = t),
      (this.stage = this.createStage(i, s)),
      (this.gl = this.stage.getContext("webgl", { antialias: !1 })),
      e ? this.setRenderTarget(e) : (this.renderTarget = null),
      (this._shaderManager = new f(this)),
      (this._skinCache = new w(this)),
      (this._currentShader = null),
      (this._currentFramebuffer = null),
      (this._screenSpaceScale = 1);
    const n = this.gl;
    n.enable(n.BLEND),
      n.blendFunc(n.ONE, n.ONE_MINUS_SRC_ALPHA),
      n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0);
    const r = n.createBuffer();
    n.bindBuffer(n.ARRAY_BUFFER, r),
      n.bufferData(
        n.ARRAY_BUFFER,
        new Float32Array([0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0]),
        n.STATIC_DRAW
      ),
      n.activeTexture(n.TEXTURE0),
      (this._penSkin = new g(this, i, s)),
      (this._collisionBuffer = this._createFramebufferInfo(
        i,
        s,
        n.NEAREST,
        !0
      ));
  }
  _createFramebufferInfo(t, e, i, s = !1) {
    const n = this.gl,
      r = n.createTexture();
    n.bindTexture(n.TEXTURE_2D, r),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_S, n.CLAMP_TO_EDGE),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_WRAP_T, n.CLAMP_TO_EDGE),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MIN_FILTER, i),
      n.texParameteri(n.TEXTURE_2D, n.TEXTURE_MAG_FILTER, i),
      n.texImage2D(
        n.TEXTURE_2D,
        0,
        n.RGBA,
        t,
        e,
        0,
        n.RGBA,
        n.UNSIGNED_BYTE,
        null
      );
    const o = {
      texture: r,
      width: t,
      height: e,
      framebuffer: n.createFramebuffer(),
    };
    if (
      (this._setFramebuffer(o),
      n.framebufferTexture2D(
        n.FRAMEBUFFER,
        n.COLOR_ATTACHMENT0,
        n.TEXTURE_2D,
        r,
        0
      ),
      s)
    ) {
      const i = n.createRenderbuffer();
      n.bindRenderbuffer(n.RENDERBUFFER, i),
        n.renderbufferStorage(n.RENDERBUFFER, n.DEPTH_STENCIL, t, e),
        n.framebufferRenderbuffer(
          n.FRAMEBUFFER,
          n.DEPTH_STENCIL_ATTACHMENT,
          n.RENDERBUFFER,
          i
        );
    }
    return o;
  }
  _setShader(t) {
    if (t !== this._currentShader) {
      const e = this.gl;
      e.useProgram(t.program);
      const i = t.attribs.a_position;
      return (
        e.enableVertexAttribArray(i),
        e.vertexAttribPointer(i, 2, e.FLOAT, !1, 0, 0),
        (this._currentShader = t),
        this._updateStageSize(),
        !0
      );
    }
    return !1;
  }
  _setFramebuffer(t) {
    t !== this._currentFramebuffer &&
      ((this._currentFramebuffer = t),
      null === t
        ? (this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null),
          this._updateStageSize())
        : (this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, t.framebuffer),
          this.gl.viewport(0, 0, t.width, t.height)));
  }
  setRenderTarget(t) {
    "string" == typeof t && (t = document.querySelector(t)),
      (this.renderTarget = t),
      this.renderTarget.classList.add("leopard__project"),
      (this.renderTarget.style.width = this.project.stage.width + "px"),
      (this.renderTarget.style.height = this.project.stage.height + "px"),
      this.renderTarget.append(this.stage);
  }
  _renderLayers(t, e = {}) {
    e = Object.assign(
      {},
      { drawMode: f.DrawModes.DEFAULT, renderSpeechBubbles: !0 },
      e
    );
    const i = t instanceof Set,
      s = "function" == typeof e.filter,
      n = (n) => !((i && !t.has(n)) || (s && !e.filter(n)));
    if (
      (n(this.project.stage) && this.renderSprite(this.project.stage, e),
      n(this._penSkin))
    ) {
      const t = o.create();
      o.scale(t, t, this._penSkin.width, -this._penSkin.height),
        o.translate(t, t, -0.5, -0.5),
        this._setSkinUniforms(this._penSkin, e.drawMode, t, 1, null),
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
    for (const t of this.project.spritesAndClones)
      n(t) && !1 !== t.visible && this.renderSprite(t, e);
  }
  _updateStageSize() {
    this._currentShader &&
      this.gl.uniform2f(
        this._currentShader.uniforms.u_stageSize,
        this.project.stage.width,
        this.project.stage.height
      ),
      null === this._currentFramebuffer &&
        this.gl.viewport(
          0,
          0,
          this.gl.drawingBufferWidth,
          this.gl.drawingBufferHeight
        );
  }
  _resize() {
    const t = this.stage.getBoundingClientRect(),
      e = window.devicePixelRatio,
      i = Math.round(t.width * e),
      s = Math.round(t.height * e);
    (this.stage.width === i && this.stage.height === s) ||
      ((this.stage.width = i),
      (this.stage.height = s),
      (this._screenSpaceScale = Math.max(
        i / this.project.stage.width,
        s / this.project.stage.height
      )),
      this._updateStageSize());
  }
  update() {
    this._resize(), this._setFramebuffer(null);
    const t = this.gl;
    t.clearColor(1, 1, 1, 1),
      t.clear(t.COLOR_BUFFER_BIT),
      this._skinCache.beginTrace(),
      this._renderLayers(),
      this._skinCache.endTrace();
  }
  createStage(t, e) {
    const i = document.createElement("canvas");
    return (
      (i.width = t),
      (i.height = e),
      (i.style.width = i.style.height = "100%"),
      (i.style.imageRendering = "pixelated"),
      (i.style.imageRendering = "crisp-edges"),
      (i.style.imageRendering = "-webkit-optimize-contrast"),
      i
    );
  }
  _setSkinUniforms(t, e, i, s, n, r) {
    const o = this.gl,
      a = t.getTexture(s * this._screenSpaceScale);
    if (!a) return;
    let h = 0;
    n && (h = n._bitmask), "number" == typeof r && (h &= r);
    const c = this._shaderManager.getShader(e, h);
    if (
      (this._setShader(c),
      o.uniformMatrix3fv(c.uniforms.u_transform, !1, i),
      0 !== h)
    ) {
      for (const t of Object.keys(n._effectValues)) {
        const e = n._effectValues[t];
        0 !== e && o.uniform1f(c.uniforms["u_" + t], e);
      }
      0 !== n._effectValues.pixelate &&
        o.uniform2f(c.uniforms.u_skinSize, t.width, t.height);
    }
    o.bindTexture(o.TEXTURE_2D, a), o.uniform1i(c.uniforms.u_texture, 0);
  }
  _calculateSpriteMatrix(t) {
    const e = o.create();
    if (!(t instanceof U)) {
      switch ((o.translate(e, e, t.x, t.y), t.rotationStyle)) {
        case I.RotationStyle.ALL_AROUND:
          o.rotate(e, e, t.scratchToRad(t.direction));
          break;
        case I.RotationStyle.LEFT_RIGHT:
          t.direction < 0 && o.scale(e, e, -1, 1);
      }
      const i = t.size / 100;
      o.scale(e, e, i, i);
    }
    const i = 1 / t.costume.resolution;
    return (
      o.translate(
        e,
        e,
        -t.costume.center.x * i,
        (t.costume.center.y - t.costume.height) * i
      ),
      o.scale(e, e, t.costume.width * i, t.costume.height * i),
      e
    );
  }
  _calculateSpeechBubbleMatrix(t, e) {
    const i = this.getBoundingBox(t);
    let s;
    e.width + i.right > this.project.stage.width / 2
      ? ((s = i.left - e.width), (e.flipped = !0))
      : ((s = i.right), (e.flipped = !1)),
      (s = Math.round(s - e.offsetX));
    const n = Math.round(i.top - e.offsetY),
      r = o.create();
    return o.translate(r, r, s, n), o.scale(r, r, e.width, e.height), r;
  }
  renderSprite(t, e) {
    const i = Object.prototype.hasOwnProperty.call(t, "size")
      ? t.size / 100
      : 1;
    if (
      (this._setSkinUniforms(
        this._skinCache.getSkin(t.costume),
        e.drawMode,
        this._calculateSpriteMatrix(t),
        i,
        t.effects,
        e.effectMask
      ),
      Array.isArray(e.colorMask) &&
        this.gl.uniform4fv(
          this._currentShader.uniforms.u_colorMask,
          e.colorMask
        ),
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6),
      e.renderSpeechBubbles && t._speechBubble && "" !== t._speechBubble.text)
    ) {
      const i = this._skinCache.getSkin(t._speechBubble);
      this._setSkinUniforms(
        i,
        e.drawMode,
        this._calculateSpeechBubbleMatrix(t, i),
        1,
        null
      ),
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }
  }
  getBoundingBox(t) {
    return _.fromMatrix(this._calculateSpriteMatrix(t));
  }
  _stencilSprite(t, e) {
    const i = this.gl;
    i.clearColor(0, 0, 0, 0),
      i.clear(i.COLOR_BUFFER_BIT | i.STENCIL_BUFFER_BIT),
      i.enable(i.STENCIL_TEST),
      i.stencilFunc(i.ALWAYS, 1, 1),
      i.stencilOp(i.KEEP, i.KEEP, i.REPLACE),
      i.colorMask(!1, !1, !1, !1);
    const s = {
      drawMode: f.DrawModes.SILHOUETTE,
      renderSpeechBubbles: !1,
      effectMask: ~u.ghost,
    };
    e &&
      ((s.colorMask = e.toRGBANormalized()),
      (s.drawMode = f.DrawModes.COLOR_MASK)),
      this._renderLayers(new Set([t]), s),
      i.stencilFunc(i.EQUAL, 1, 1),
      i.stencilOp(i.KEEP, i.KEEP, i.KEEP),
      i.colorMask(!0, !0, !0, !0);
  }
  checkSpriteCollision(t, e, i, s) {
    if (!t.visible) return !1;
    e instanceof Set || (e = e instanceof Array ? new Set(e) : new Set([e]));
    const n = this.getBoundingBox(t).snapToInt(),
      r = _.fromBounds(1 / 0, -1 / 0, 1 / 0, -1 / 0);
    for (const t of e) _.union(r, this.getBoundingBox(t).snapToInt(), r);
    if (!n.intersects(r)) return !1;
    if (i) return !0;
    const o = this._collisionBuffer.width / 2,
      a = this._collisionBuffer.height / 2,
      h = _.intersection(n, r).clamp(-o, o, -a, a);
    if (0 === h.width || 0 === h.height) return !1;
    this._setFramebuffer(this._collisionBuffer),
      this._stencilSprite(t, s),
      this._renderLayers(e, {
        drawMode: f.DrawModes.SILHOUETTE,
        effectMask: ~u.ghost,
      });
    const c = this.gl;
    c.disable(c.STENCIL_TEST);
    const l = new Uint8Array(h.width * h.height * 4);
    c.readPixels(
      h.left + o,
      h.bottom + a,
      h.width,
      h.height,
      c.RGBA,
      c.UNSIGNED_BYTE,
      l
    );
    for (let t = 0; t < l.length; t += 4) if (0 !== l[t + 3]) return !0;
    return !1;
  }
  checkColorCollision(t, e, i) {
    const s = this.getBoundingBox(t).snapToInt(),
      n = this._collisionBuffer.width / 2,
      r = this._collisionBuffer.height / 2;
    if ((s.clamp(-n, n, -r, r), 0 === s.width || 0 === s.height)) return !1;
    this._setFramebuffer(this._collisionBuffer);
    const o = this.gl;
    o.clearColor(0, 0, 0, 0),
      o.clear(o.COLOR_BUFFER_BIT | o.STENCIL_BUFFER_BIT),
      this._setFramebuffer(this._collisionBuffer),
      this._stencilSprite(t, i),
      this._renderLayers(null, { filter: (e) => e !== t }),
      o.disable(o.STENCIL_TEST);
    const a = new Uint8Array(s.width * s.height * 4);
    o.readPixels(
      s.left + n,
      s.bottom + r,
      s.width,
      s.height,
      o.RGBA,
      o.UNSIGNED_BYTE,
      a
    );
    const h = e.toRGBA();
    for (let t = 0; t < a.length; t += 4)
      if (
        0 !== a[t + 3] &&
        0 == (248 & (a[t] ^ h[0])) &&
        0 == (248 & (a[t + 1] ^ h[1])) &&
        0 == (240 & (a[t + 2] ^ h[2]))
      )
        return !0;
    return !1;
  }
  checkPointCollision(t, e, i) {
    if (!t.visible) return !1;
    if (!this.getBoundingBox(t).containsPoint(e.x, e.y)) return !1;
    if (i) return !0;
    this._setFramebuffer(this._collisionBuffer);
    const s = this.gl;
    s.clearColor(0, 0, 0, 0),
      s.clear(s.COLOR_BUFFER_BIT),
      this._renderLayers(new Set([t]), { effectMask: ~u.ghost });
    const n = new Uint8Array(4),
      r = this._collisionBuffer.width / 2,
      o = this._collisionBuffer.height / 2;
    return (
      s.readPixels(e.x + r, e.y + o, 1, 1, s.RGBA, s.UNSIGNED_BYTE, n),
      0 !== n[3]
    );
  }
  penLine(t, e, i, s) {
    this._penSkin.penLine(t, e, i, s);
  }
  clearPen() {
    this._penSkin.clear();
  }
  stamp(t) {
    this._setFramebuffer(this._penSkin._framebufferInfo),
      this._renderLayers(new Set([t]), { renderSpeechBubbles: !1 });
  }
  displayAskBox(t) {
    const e = document.createElement("form");
    e.classList.add("leopard__askBox");
    const i = document.createElement("span");
    i.classList.add("leopard__askText"), (i.innerText = t), e.append(i);
    const s = document.createElement("input");
    (s.type = "text"), s.classList.add("leopard__askInput"), e.append(s);
    const n = document.createElement("button");
    return (
      n.classList.add("leopard__askButton"),
      (n.innerText = "Answer"),
      e.append(n),
      this.renderTarget.append(e),
      s.focus(),
      new Promise((t) => {
        e.addEventListener("submit", (i) => {
          i.preventDefault(), e.remove(), t(s.value);
        });
      })
    );
  }
}
class j {
  constructor(t, e, i) {
    (this._stage = t),
      (this._canvas = e),
      this._canvas.tabIndex < 0 && (this._canvas.tabIndex = 0),
      (this.mouse = { x: 0, y: 0, down: !1 }),
      this._canvas.addEventListener("mousemove", this._mouseMove.bind(this)),
      this._canvas.addEventListener("mousedown", this._mouseDown.bind(this)),
      this._canvas.addEventListener("mouseup", this._mouseUp.bind(this)),
      this._canvas.addEventListener("keyup", this._keyup.bind(this)),
      this._canvas.addEventListener("keydown", this._keydown.bind(this)),
      (this.keys = []),
      (this._onKeyDown = i);
  }
  _mouseMove(t) {
    const e = this._canvas.getBoundingClientRect(),
      i = this._stage.width / e.width,
      s = this._stage.height / e.height,
      n = (t.clientX - e.left) * i,
      r = (t.clientY - e.top) * s;
    this.mouse = {
      ...this.mouse,
      x: n - this._stage.width / 2,
      y: -r + this._stage.height / 2,
    };
  }
  _mouseDown() {
    this.mouse = { ...this.mouse, down: !0 };
  }
  _mouseUp() {
    this.mouse = { ...this.mouse, down: !1 };
  }
  _keyup(t) {
    const e = this._getKeyName(t);
    this.keys = this.keys.filter((t) => t !== e);
  }
  _keydown(t) {
    t.preventDefault();
    const e = this._getKeyName(t);
    -1 === this.keys.indexOf(e) && this.keys.push(e), this._onKeyDown(e);
  }
  _getKeyName(t) {
    return "ArrowUp" === t.key
      ? "up arrow"
      : "ArrowDown" === t.key
      ? "down arrow"
      : "ArrowLeft" === t.key
      ? "left arrow"
      : "ArrowRight" === t.key
      ? "right arrow"
      : " " === t.key
      ? "space"
      : "Digit" === t.code.substring(0, 5)
      ? t.code[5]
      : t.key.toLowerCase();
  }
  keyPressed(t) {
    return "any" === t ? this.keys.length > 0 : this.keys.indexOf(t) > -1;
  }
  focus() {
    this._canvas.focus();
  }
}
class G {
  constructor(t, e = {}, { frameRate: i = 30 } = {}) {
    (this.stage = t), (this.sprites = e), Object.freeze(e);
    for (const t of this.spritesAndClones) t._project = this;
    (this.stage._project = this),
      (this.renderer = new z(this)),
      (this.input = new j(this.stage, this.renderer.stage, (t) => {
        this.fireTrigger(r.KEY_PRESSED, { key: t });
      })),
      (this.runningTriggers = []),
      this.restartTimer(),
      (this.answer = null),
      setInterval(() => {
        this.step();
      }, 1e3 / i),
      this._renderLoop();
  }
  attach(t) {
    this.renderer.setRenderTarget(t),
      this.renderer.stage.addEventListener("click", () => {
        const t = (t) =>
          t instanceof U ||
          this.renderer.checkPointCollision(
            t,
            { x: this.input.mouse.x, y: this.input.mouse.y },
            !1
          );
        let e = [];
        for (let i = 0; i < this.spritesAndStage.length; i++) {
          const s = this.spritesAndStage[i],
            n = s.triggers.filter((t) => t.matches(r.CLICKED, {}));
          n.length > 0 &&
            t(s) &&
            (e = [...e, ...n.map((t) => ({ trigger: t, target: s }))]);
        }
        this._startTriggers(e);
      });
  }
  greenFlag() {
    this.fireTrigger(r.GREEN_FLAG), this.input.focus();
  }
  step() {
    const t = this.runningTriggers;
    for (let e = 0; e < t.length; e++) t[e].trigger.step();
    this.runningTriggers = this.runningTriggers.filter(
      ({ trigger: t }) => !t.done
    );
  }
  render() {
    this.renderer.update(this.stage, this.spritesAndClones);
    for (const t of [...Object.values(this.sprites), this.stage])
      for (const e of Object.values(t.watchers))
        e.updateDOM(this.renderer.renderTarget);
  }
  _renderLoop() {
    requestAnimationFrame(this._renderLoop.bind(this)), this.render();
  }
  fireTrigger(t, e) {
    if (t === r.GREEN_FLAG) {
      this.restartTimer(), this.stopAllSounds(), (this.runningTriggers = []);
      for (const t in this.sprites) {
        this.sprites[t].clones = [];
      }
      for (const t of this.spritesAndStage)
        t.effects.clear(), t.audioEffects.clear();
    }
    let i = [];
    for (let s = 0; s < this.spritesAndStage.length; s++) {
      const n = this.spritesAndStage[s],
        r = n.triggers.filter((i) => i.matches(t, e));
      i = [...i, ...r.map((t) => ({ trigger: t, target: n }))];
    }
    return this._startTriggers(i);
  }
  _startTriggers(t) {
    for (const e of t)
      this.runningTriggers.find(
        (t) => e.trigger === t.trigger && e.target === t.target
      ) || this.runningTriggers.push(e);
    return Promise.all(t.map(({ trigger: t, target: e }) => t.start(e)));
  }
  get spritesAndClones() {
    return Object.values(this.sprites)
      .flatMap((t) => t.andClones())
      .sort((t, e) => t._layerOrder - e._layerOrder);
  }
  get spritesAndStage() {
    return [...this.spritesAndClones, this.stage];
  }
  changeSpriteLayer(t, e, i = t) {
    let s = this.spritesAndClones;
    const n = s.indexOf(t);
    let r = s.indexOf(i) + e;
    r < 0 && (r = 0),
      r > s.length - 1 && (r = s.length - 1),
      s.splice(n, 1),
      s.splice(r, 0, t),
      s.forEach((t, e) => {
        t._layerOrder = e + 1;
      });
  }
  stopAllSounds() {
    for (const t of this.spritesAndStage) t.stopAllOfMySounds();
  }
  restartTimer() {
    this.timerStart = new Date();
  }
  async askAndWait(t) {
    this.answer = await this.renderer.displayAskBox(t);
  }
}
class V {
  constructor({
    value: t = () => "",
    setValue: e = () => {},
    label: i,
    style: s = "normal",
    visible: n = !0,
    color: r = A.rgb(255, 140, 26),
    step: o = 1,
    x: a = -240,
    y: h = 180,
    width: c,
    height: l,
  }) {
    this.initializeDOM(),
      (this.value = t),
      (this.setValue = e),
      (this._previousValue = Symbol("NO_PREVIOUS_VALUE")),
      (this.label = i),
      (this.style = s),
      (this.visible = n),
      (this.color = r),
      (this.step = o),
      (this.x = a),
      (this.y = h),
      (this.width = c),
      (this.height = l);
  }
  initializeDOM() {
    const t = document.createElement("div");
    t.classList.add("leopard__watcher");
    const e = document.createElement("div");
    e.classList.add("leopard__watcherLabel"), t.append(e);
    const i = document.createElement("div");
    i.classList.add("leopard__watcherValue"), t.append(i);
    const s = document.createElement("input");
    (s.type = "range"),
      s.classList.add("leopard__watcherSlider"),
      s.addEventListener("input", (t) => {
        this.setValue(Number(t.target.value));
      }),
      t.append(s),
      (this._dom = { node: t, label: e, value: i, slider: s });
  }
  updateDOM(t) {
    if (
      (t && !t.contains(this._dom.node) && t.append(this._dom.node),
      !this.visible)
    )
      return;
    const e = this.value(),
      i = Array.isArray(e);
    if ((this._dom.node.classList.toggle("leopard__watcher--list", i), i)) {
      if (
        !Array.isArray(this._previousValue) ||
        JSON.stringify(e.map(String)) !==
          JSON.stringify(this._previousValue.map(String))
      ) {
        this._dom.value.innerHTML = "";
        for (const [t, i] of e.entries()) {
          const e = document.createElement("div");
          e.classList.add("leopard__watcherListItem");
          const s = document.createElement("div");
          s.classList.add("leopard__watcherListItemIndex"), (s.innerText = t);
          const n = document.createElement("div");
          n.classList.add("leopard__watcherListItemContent"),
            (n.innerText = i.toString()),
            e.append(s),
            e.append(n),
            this._dom.value.append(e);
        }
      }
    } else
      e !== this._previousValue && (this._dom.value.innerText = e.toString());
    (this._previousValue = i ? [...e] : e),
      "slider" === this._style && (this._dom.slider.value = e);
    const s =
      0.299 * this.color.r + 0.587 * this.color.g + 0.114 * this.color.b > 162
        ? "#000"
        : "#fff";
    this._dom.value.style.setProperty("--watcher-color", this.color.toString()),
      this._dom.value.style.setProperty("--watcher-text-color", s);
  }
  get visible() {
    return this._visible;
  }
  set visible(t) {
    (this._visible = t),
      (this._dom.node.style.visibility = t ? "visible" : "hidden");
  }
  get x() {
    return this._x;
  }
  set x(t) {
    (this._x = t), (this._dom.node.style.left = t - 240 + "px");
  }
  get y() {
    return this._y;
  }
  set y(t) {
    (this._y = t), (this._dom.node.style.top = 180 - t + "px");
  }
  get width() {
    return this._width;
  }
  set width(t) {
    (this._width = t), (this._dom.node.style.width = t ? t + "px" : void 0);
  }
  get height() {
    return this._height;
  }
  set height(t) {
    (this._height = t), (this._dom.node.style.height = t ? t + "px" : void 0);
  }
  get style() {
    return this._style;
  }
  set style(t) {
    (this._style = t),
      this._dom.node.classList.toggle(
        "leopard__watcher--normal",
        "normal" === t
      ),
      this._dom.node.classList.toggle("leopard__watcher--large", "large" === t),
      this._dom.node.classList.toggle(
        "leopard__watcher--slider",
        "slider" === t
      );
  }
  get min() {
    return this._min;
  }
  set min(t) {
    (this._min = t), (this._dom.slider.min = t);
  }
  get max() {
    return this._max;
  }
  set max(t) {
    (this._max = t), (this._dom.slider.max = t);
  }
  get step() {
    return this._step;
  }
  set step(t) {
    (this._step = t), (this._dom.slider.step = t);
  }
  get label() {
    return this._label;
  }
  set label(t) {
    (this._label = t), (this._dom.label.innerText = t);
  }
}
export {
  A as Color,
  S as Costume,
  G as Project,
  F as Sound,
  I as Sprite,
  U as Stage,
  r as Trigger,
  V as Watcher,
};
//# sourceMappingURL=index.esm.js.map
