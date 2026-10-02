# Spatially-Aware Hotspot-to-Actuator Targeting

An interactive browser demonstration of how a manually selected synthetic hotspot in a camera view can be localized as a physical 3D target and translated into a Pan/Tilt target for a separately positioned fire monitor.

![Demo screenshot](screenshot.png)

**Live demo:** `<https://wobuzaijiaa.github.io/hotspot2actuator/>`

> **Independent technical demonstration inspired by industrial spatial-computing and automated-actuation scenarios. All geometry, parameters, images, and data are synthetic. The implementation does not reproduce or disclose any customer system.**

---

## What this repository demonstrates

The demo focuses on the spatial targeting step between **image-based observation** and **actuator response**.

| Stage | Demonstrated here |
|---|---|
| Thermal monitoring | No — synthetic camera image |
| Fire detection / filtering | No — hotspot selected manually |
| Image target → physical 3D target | Yes |
| 3D target → fire-monitor Pan/Tilt | Yes |
| Fire monitor, suppression and control interfaces | No — Pan/Tilt are calculated and displayed, not executed |

The central idea is that a target identified in a camera image is not yet a physical actuator target. It must first be interpreted within a shared spatial reference and then expressed relative to the actuator.

The demonstration makes this transformation visible and interactive.

---

## The spatial problem

A camera and a fire monitor may be installed at different positions and orientations. A selected image point therefore cannot be sent directly to the monitor.

**A pixel defines a viewing ray, not a 3D point.** The camera shows in which direction a hotspot lies, not how far away it is. A physical target requires additional spatial information about the environment.

In this demo, the hotspot is assumed to lie on the ground, and the target sits at an entered height above that ground point. Once the target is established in 3D, its position can be related to the monitor's own coordinate frame and converted into the corresponding Pan/Tilt direction.

---

## Using the demo

Open the HTML file in a modern browser. No installation or server is required.

Select a point in the synthetic camera view to see the corresponding spatial target and Pan/Tilt result update. Camera and monitor positions, camera orientation and the target height can be changed in the side panel.

The demo reports when no target can be localized, when the monitor has no Pan/Tilt solution, and when the target falls outside the camera's field of view.

It is a single HTML file written in plain HTML, CSS and JavaScript. It loads Tailwind CSS and web fonts from CDNs, so an internet connection is needed.

---

## Spatial Reference

The demonstration uses a common world coordinate system to relate the camera, target environment and fire monitor.

In a physical installation, a spatial reference could be established by surveying or 3D scanning the site. Identifiable calibration targets can be placed at selected locations before scanning so that their measured positions can be identified in the resulting 3D model. These reference points provide known spatial coordinates for subsequent calibration and validation.

In this demonstration, the spatial reference is represented by predefined synthetic positions and orientations rather than real survey or scan data.

## Calibration Concept

The key engineering challenge is not only acquiring 3D geometry, but establishing and validating the pose of each sensing and actuation device within the common spatial reference.

A possible physical calibration workflow is:

| Stage | Purpose |
|---|---|
| Reference target placement | Place identifiable calibration targets at selected physical locations |
| 3D scanning | Capture the site and calibration targets in a common spatial model |
| Reference extraction | Identify the calibration targets and their measured 3D coordinates |
| Camera pose calibration | Match observed target features with their 3D coordinates to estimate the camera's extrinsic pose |
| Actuator pose/axis calibration | Establish the actuator reference frame and pointing-axis relationship relative to the common spatial reference |
| Calibration validation | Use independent reference points and residual errors to verify the resulting spatial transformations |
| Runtime use | Apply the calibrated transformations to convert image-based targets into actuator coordinates |

The resulting calibration establishes the spatial relationship between the sensing system, the scene and the actuator. The demonstration uses predefined synthetic poses instead of performing this physical calibration process.

The key principle is that **3D scanning provides the spatial geometry, while calibration establishes and validates the pose relationships that connect perception to physical action**.

---

## Production context

The demonstration represents one part of a broader industrial fire-safety problem.

In applications such as Material Recovery Facilities, large quantities of combustible material may require continuous monitoring and automated intervention. This involves distinct technical challenges:

| Dimension | Question |
|---|---|
| **Detection** | Can a potential fire condition be identified while controlling false alarms? |
| **Spatial targeting** | Can the identified target be localized and converted into an executable actuator direction? |

**Detection establishes what requires intervention; spatial targeting establishes where the actuator should respond.**

This repository addresses the second problem only.

It demonstrates how information originating in image space can be connected to a physical target and subsequently to an actuator direction.

---

## Scope and limitations

- All images, geometry, positions, measurements and target data are synthetic.
- The hotspot is selected manually; thermal sensing, fire detection and filtering are not implemented.
- The target is assumed to lie on the ground, at an entered height above the selected point. The camera does not measure depth, so a wrong assumption gives a wrong target.
- Camera calibration, lens distortion and real-world measurement uncertainty are not modeled.
- No fire monitor, suppression system, hardware or control interface is involved; Pan/Tilt are calculated and displayed only.
- The demonstration is not a validated model of a real installation and does not implement operational safety logic.

These limitations define the scope of the demonstration rather than the scope of a production system.

---

## Related documentation

| Document | Purpose |
|---|---|
| [`geometry-model.md`](geometry-model.md) | Coordinate systems, camera-to-world transformation, target-plane intersection, monitor-frame transformation and Pan/Tilt calculation |
