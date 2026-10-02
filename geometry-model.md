# Geometry Model of the Spatial Hotspot-to-Actuator Targeting Demo

## 1. Purpose

This document describes the spatial geometry model used in the demonstration.

The purpose of the model is to establish the physical location of a manually selected hotspot from its position in a synthetic camera image, and to transform that location into Pan/Tilt angles for aiming a separately positioned fire monitor.

The model demonstrates the spatial relationship between image coordinates, camera geometry, physical target coordinates, and the actuator's own coordinate frame. It is intentionally separated from the system architecture and fire-detection logic described in the main project README. No thermal detection is part of this model: the hotspot is selected by hand.

## 2. Geometry Model

The demonstration represents the environment in one common world coordinate system. The camera is placed in it by a position and an orientation (yaw and pitch). The fire monitor is placed in it by a position; its zero-pan direction is fixed to world `+X`. The hotspot is assumed to lie on the ground plane, and the target is that ground point raised to a height entered by the user.

A hotspot is selected in image coordinates and then transformed, step by step, into a physical target and an actuator command.

| Stage | Input | Transformation | Output |
|---|---|---|---|
| Image selection | Synthetic camera image | Manual hotspot selection | Image coordinate `(u, v)` |
| Camera model | `(u, v)` + camera intrinsics and pose | Image-to-ray transformation | 3D viewing ray in the world frame |
| Spatial model | Viewing ray + ground plane | Ray–plane intersection | Ground point `(X, Y, 0)` |
| Target height | Ground point + entered height `h` | Vertical extrusion | Physical target `(X, Y, h)` |
| Monitor frame | Physical target + monitor position | World → monitor transformation (translation) | Target relative to the monitor |
| Targeting model | Monitor-relative target | Direction calculation | Pan / Tilt |

The core geometric problem is therefore:

**Image point → Viewing ray → Ground point → Target at entered height → Monitor-relative target → Pan/Tilt**

This converts a two-dimensional image selection into a location in the modeled physical environment, and that location into an actuator direction.

## 3. Coordinate Systems

Four coordinate systems are relevant to the demonstration.

| Coordinate System | Representation | Axes | Purpose |
|---|---|---|---|
| Image | `(u, v)` | `u` right, `v` down; continuous coordinates, origin at the top-left corner | Position of the selected hotspot in the image |
| Camera (optical) | `(x_c, y_c, z_c)` | `x` right, `y` down, `z` forward | Direction relative to the camera |
| World | `(X, Y, Z)` | Right-handed, `Z` up | Common spatial reference for camera, target and monitor |
| Monitor | `(x, y, z)` | `x` forward (world `+X`), `y` left (world `+Y`), `z` up; origin at the monitor | The actuator's own reference for Pan/Tilt |

The world coordinate system provides the common spatial reference. The camera and the monitor do not need to share a local frame; each is related to the world frame by its own position (and, for the camera, its orientation).

Camera orientation is given by yaw and pitch. Yaw is counter-clockwise from world `+X` viewed from above. Pitch is positive when looking up. Roll is not used.

The hotspot is assumed to lie on the ground plane `Z = 0`. A plane is written as:

`n · P + d = 0`

where `n` is the plane normal and `d` defines its position. For the ground plane, `n = (0, 0, 1)` and `d = 0`.

## 4. Image Point to Viewing Ray

A selected hotspot provides an image coordinate `(u, v)`.

The camera intrinsic matrix `K` is configured, not estimated by calibration. It is derived from the image size `W × H` and the horizontal field of view, assuming square pixels and a centred principal point:

`fx = fy = (W / 2) / tan(HFOV / 2)`,  `cx = W / 2`,  `cy = H / 2`

| Element | Definition | Meaning |
|---|---|---|
| Image point | `(u, v)` | Selected hotspot position |
| Homogeneous image point | `[u, v, 1]ᵀ` | Homogeneous representation |
| Camera intrinsics | `K` | Configured camera parameters |
| Camera-space direction | `r_c = K⁻¹ [u, v, 1]ᵀ = [(u − cx)/fx, (v − cy)/fy, 1]ᵀ` | Viewing direction relative to the camera |
| Unit direction | `r̂_c = r_c / ‖r_c‖` | Normalized to unit length |

The direction is then transformed from camera coordinates into world coordinates:

`r_w = R_cw · r̂_c`

`R_cw` is the rotation from the camera optical frame (`x` right, `y` down, `z` forward) to the world frame. It is built from the camera's yaw and pitch together with the fixed mapping between the optical axes and the camera body axes (`x` forward, `y` left, `z` up). Using yaw and pitch alone, without that fixed mapping, produces a wrong ray.

The camera position in world coordinates is `C`. The viewing ray is:

`P(t) = C + t · r_w`,  with `t > 0`

where `t` is the distance along the viewing direction.

## 5. Ray–Plane Intersection

The ground point is obtained by intersecting the viewing ray with the ground plane.

For a general plane `n · P + d = 0`, substituting the ray equation gives:

`n · (C + t · r_w) + d = 0`

The distance parameter is therefore:

`t = −(n · C + d) / (n · r_w)`

and the intersection point is:

`G = C + t · r_w`

For the ground plane this simplifies to `t = −C_z / r_w,z`: the value of `t` at which the ray reaches zero elevation. The result is the ground point `G = (X, Y, 0)`.

**Validity conditions.** The intersection is rejected, and an error is reported, when:

| Condition | Meaning |
|---|---|
| `abs(n · r_w) < ε` | The ray is parallel to the ground and never meets it |
| `t ≤ 0` | The intersection lies behind the camera (this includes rays pointing at or above the horizon) |

## 6. Target Height

The ray determines only where on the ground the hotspot is. The target used for aiming is that ground point raised to a height `h` entered by the user:

`P_target = (G_x, G_y, h)`

The ground point is fixed when the hotspot is selected. Changing `h` moves the target vertically and does not change `(X, Y)`.

The ground point lies on the viewing ray, but the raised target generally does not. For `h > 0` the target is therefore not on the camera's viewing ray; the ray is used only to find the ground footprint. For `h = 0` the target is the ray–ground intersection itself.

A hotspot occupying a particular image position does not by itself define its physical distance. The ground-plane assumption provides the additional geometric information required to determine the physical point. It is an assumption of the scenario, not something the camera measures, and a wrong assumption gives a wrong target. Any known surface could provide the same kind of constraint; this demonstration uses only the ground plane.

The model intersects an infinite plane. It does not check whether the ground point lies within the real extent of the ground, for example inside the facility boundary.

## 7. Target Coordinate to Fire-Monitor Pan/Tilt

Once the target has been localized as a world-space point `P_target`, the fire monitor's position `M` is used to express it relative to the monitor. The monitor's zero-pan direction is fixed to world `+X`, so its frame is the world frame shifted to `M`, and no rotation is needed.

**Step 1: world → monitor frame.**

`(x, y, z) = P_target − M`

with `x` forward (`+X`), `y` left (`+Y`) and `z` up.

**Step 2: direction → angles.**

`pan = atan2(y, x)`

`tilt = atan2(z, √(x² + y²))`

Pan is the horizontal angle from the monitor's forward direction (`+X`), positive counter-clockwise when viewed from above (a target toward `+Y` has positive pan), and is taken in the range −180° to +180°. Tilt is positive upward. If `x` and `y` are both close to zero (target directly above or below the monitor), pan is undefined and is reported as such.

| Input | Calculation | Output |
|---|---|---|
| Monitor position | `M` | Reference position |
| Target position | `P_target` | Physical target |
| Monitor-relative target | `P_target − M` | `(x, y, z)` |
| Horizontal components | `atan2(y, x)` | Pan |
| Vertical component + horizontal range | `atan2(z, √(x² + y²))` | Tilt |

**Illustrative values (demo defaults).** Camera at `C = (5, 8, 8)` m, yaw 25°, pitch −25°, image 1280 × 720, horizontal FOV 70°; selected pixel `(450, 350)`; target height `h = 2` m; monitor at `M = (35, 10, 6)` m.

| Quantity | Value |
|---|---|
| Viewing ray in the world frame `r_w` | `(0.7223, 0.5613, −0.4040)` |
| Ground point `G` | `(19.30, 19.11, 0.00)` |
| Target `P_target` | `(19.30, 19.11, 2.00)` |
| `P_target − M` | `(−15.70, 9.11, −4.00)` |
| Pan `atan2(9.11, −15.70)` | `149.9°` |
| Tilt `atan2(−4.00, 18.15)` | `−12.4°` |
| Distance monitor → target | `18.6 m` |

The demonstration therefore establishes a complete geometric relationship between the selected hotspot and the corresponding aiming direction.

## 8. Demonstration Assumptions

The geometry model is a controlled technical demonstration rather than a complete industrial calibration model.

| Assumption | Purpose |
|---|---|
| Camera intrinsics are known (configured values) | Required to reconstruct the viewing direction |
| Camera pose is known | Required to transform the ray into world coordinates |
| The hotspot lies on the ground plane, and the target height is entered | Provides the depth constraint and the aiming height |
| Coordinate systems are consistently defined | Enables spatial transformation |
| Fire-monitor position is known; its zero-pan direction is world `+X` | Required to express the target relative to the monitor |
| The ground is flat and level (`Z = 0`) | Allows the ray–ground intersection to be calculated |

In a production implementation, additional factors could include camera calibration accuracy, thermal-camera alignment, lens distortion, mechanical installation tolerances, monitor kinematics, occlusion, changing environmental geometry, and independent safety interlocks.

These considerations are outside the scope of the demonstration geometry.

## 9. What the Model Demonstrates

The key technical capability demonstrated by the model is spatial localization and its conversion into an actuator direction.

| Image-Based Result | Spatial Result |
|---|---|
| Hotspot selected at `(u, v)` | Hotspot localized at `(X, Y, Z)` |
| Two-dimensional image position | Physical position in the modeled environment |
| No explicit depth | Depth determined through geometric constraint |
| Image selection | Targeting input (Pan/Tilt) |

The model therefore demonstrates that a target selected in an image can be interpreted within a defined three-dimensional spatial reference and converted into a physically meaningful target coordinate and an actuator-relative direction.

## 10. Scope and Limitations

The model deliberately focuses on the geometric transformation required for the demonstration.

It does not attempt to represent every aspect of an industrial fire-suppression system, including:

- Thermal imaging, hotspot detection and filtering
- Full camera calibration, lens distortion and sensor fusion
- Complex or continuously changing 3D environments
- Occlusion: neither the camera's view nor the monitor's line of sight is checked
- Bounded target surfaces (see Section 6)
- Monitor mounting orientation (zero pan is fixed to world `+X`) and Pan/Tilt operating limits
- Fire-monitor mechanical control implementation
- Water trajectory and ballistic modelling
- Hydraulic performance
- Safety interlocks and suppression authorization logic
- Industrial functional-safety certification

The geometry model should therefore be understood as the spatial reasoning layer supporting the demonstration.

Its purpose is to make the relationship between **selected image location, physical target location, and monitor aiming direction** explicit and technically traceable.
