# Geometry Model of Spatial Target Planning

## 1. Purpose

The model describes the geometric relationship between a virtual camera, a terrain-surface target, and a fire monitor.

It supports:
- Target localization from a camera image point or direct world-view selection.
- Camera field-of-view, range, and terrain line-of-sight checks.
- Monitor pan, tilt, distance, range, and line-of-sight calculations.

The demo uses a synthetic scene and manual target selection. It does not perform automatic target detection, image-based depth estimation, or physical device control.

## 2. Coordinate System

All components share a Cartesian world coordinate system:

- $X,Y$: horizontal position.
- $Z$: elevation, positive upward.
- Positions and distances: meters.
- Angles: degrees.

The terrain is a heightfield:

$$
Z=H(X,Y)
$$

Camera orientation is defined by yaw and pitch. The monitor's zero-pan direction is world $+X$; positive pan points toward $+Y$, and positive tilt points upward.

Camera and monitor heights above ground are converted to world elevation using the terrain height at their respective horizontal positions.

## 3. Target Localization

Targets are points on the modeled terrain surface:

$$
\mathbf P_t=(X,Y,H(X,Y))
$$

**Camera selection:** An image coordinate defines a camera viewing ray. The target is the first valid forward intersection with the terrain.

**World selection:** The target is selected directly on the modeled surface.

Terrain coverage and world bounds define the valid target domain. Terrain evaluation is unavailable outside valid coverage; values are not extrapolated.

The target state is defined by its horizontal coordinates. Its elevation is derived from the active terrain.

## 4. Camera Geometry

The camera uses an ideal pinhole model defined by image resolution, horizontal field of view, position, yaw, and pitch. Lens distortion and roll are not modeled.

For image point $(u,v)$, the camera-frame viewing direction is:

$$
\mathbf r_c=
\begin{bmatrix}
(u-c_x)/f\\
(v-c_y)/f\\
1
\end{bmatrix}
$$

where $f$ is the focal length in pixel units and $(c_x,c_y)$ is the image center. The world-space ray is obtained by rotating and normalizing this direction:

$$
\mathbf P(t)=\mathbf C+t\mathbf r_w,\quad t>0
$$

The target is localized by intersecting this ray with the terrain.

## 5. Monitor Geometry

For monitor position $\mathbf M$ and target position $\mathbf P_t$, define:

$$
(x,y,z)=\mathbf P_t-\mathbf M
$$

$$
d_h=\sqrt{x^2+y^2},\qquad
d_{3D}=\sqrt{x^2+y^2+z^2}
$$

$$
\mathrm{pan}=\text{atan2}(y,x)
$$

$$
\mathrm{tilt}=\text{atan2}(z,d_h)
$$

Pan and tilt describe the straight-line pointing direction. They do not model water-jet trajectory, hardware limits, or physical actuation.

## 6. Validation

The model evaluates the following conditions independently:

| Check | Purpose |
|---|---|
| Target domain | Valid world bounds and terrain coverage |
| Terrain consistency | Target elevation agrees with the active surface, when applicable |
| Camera field of view | Target is in front of the camera and projects inside the image |
| Camera range | Camera-to-target 3D distance is within range |
| Camera line of sight | Terrain does not obstruct the camera-to-target segment |
| Monitor range | Monitor-to-target 3D distance is within range |
| Monitor line of sight | Terrain does not obstruct the monitor-to-target segment |

Checks report `pass`, `fail`, or `unknown`. Unavailable numeric results are represented as null, not zero.

A valid target position does not necessarily imply camera visibility or monitor reachability.

## 7. Assumptions and Limitations

- Targets lie on the modeled terrain; elevated target offsets are not supported.
- Terrain is represented as a heightfield, not arbitrary 3D geometry.
- Line-of-sight checks use terrain sampling and may miss narrow obstructions.
- Buildings, vegetation, and other independent 3D obstacles are not modeled.
- Camera parameters are configured rather than physically calibrated.
- Monitor angles are geometric results, not hardware commands or proof of suppression effectiveness.

The demo is intended for geometry exploration and validation, not operational or safety-critical decisions.

## 8. Output

The application can export a JSON report containing the scene configuration, terrain, camera and monitor parameters, target position, calculated geometry, and validation results.

For implementation-specific behavior and numeric verification, consult the source code and dedicated tests.
