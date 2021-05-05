/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import * as faces from "../api/faces";
import Webcam from "react-webcam";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function CheckIn() {
  const dataFace = useSelector((state) => state.faceReducer.list);
  const webcam = React.useRef(null);
  const inputSize = 160;
  const [WIDTH] = useState(512);
  const [HEIGHT] = useState(512);
  const [detections, setdetections] = useState();
  const [faceMatcher, setfaceMatcher] = useState();
  const [match, setmatch] = useState();
  const [facingMode, setfacingmode] = useState("user");
  const [Count, setCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      await setInputDevice();
      await getfaceData();
      if (!!faceMatcher) {
        captured();
      } else {
        setCount(Count + 1);
        console.log(Count);
      }
    };
    return fetch();
  }, [Count]);

  const getfaceData = async () => {
    setfaceMatcher(await faces.createMatcher(dataFace));
  };

  //   Fungsi Untuk Menentukan Camera
  const setInputDevice = () => {
    navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      let inputDevice = await devices.filter(
        (device) => device.kind === "videoinput"
      );
      if (inputDevice.length < 2) {
        await setfacingmode("user");
      }
    });
  };

  // Fungsi Untuk Mengcapture gambar dan memprosesnya secara berkala.
  const captured = async () => {
    await faces.loadModels();
    try {
      const capture = webcam.current.getScreenshot();
      if (!!capture) {
        faces
          .getFullFaceDescription(capture, inputSize)
          .then(async (fullDesc) => {
            if (!!fullDesc) {
              const desc = fullDesc.map((fd) => fd.descriptor);
              const detect = fullDesc.map((fd) => fd.detection);
              console.log(desc);
              if (!!desc && !!faceMatcher) {
                setdetections(detect);
                const match = await desc.map((descriptor) =>
                  faceMatcher.findBestMatch(descriptor)
                );
                setmatch(match);
                console.log(detect);
                console.log(match);
                setCount(Count + 1);
                console.log(Count);
              } else {
                setCount(Count + 1);
                console.log(Count);
              }
            }
          });
      } else {
        setCount(Count + 1);
        console.log(Count);
      }
    } catch (err) {
      console.log(err);
    }
  };

  let videoConstraints = null;
  if (!!facingMode) {
    videoConstraints = {
      width: WIDTH,
      height: HEIGHT,
      facingMode: facingMode,
    };
  }

  let drawBox = null;
  if (!!detections) {
    drawBox = detections.map((detection, i) => {
      let _H = detection.box.height;
      let _W = detection.box.width;
      let _X = detection.box._x;
      let _Y = detection.box._y;
      return (
        <div key={i}>
          <div
            style={{
              position: "absolute",
              border: "solid",
              borderColor: "blue",
              height: _H,
              width: _W,
              transform: `translate(${_X}px,${_Y}px)`,
            }}
          >
            {match && match[i] ? (
              <p
                className="text-center"
                style={{
                  backgroundColor: "blue",
                  border: "solid",
                  borderColor: "blue",
                  width: _W,
                  marginTop: 0,
                  color: "#fff",
                  transform: `translate(-3px,${_H}px)`,
                }}
              >
                {match[i].label}
              </p>
            ) : null}
          </div>
        </div>
      );
    });
  }

  return (
    <div
      className="body-custom"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 className="text-center text-white">FACE RECOGNITION</h1>
      <div className="border border-color p-2">
        <div
          style={{
            width: WIDTH,
            height: HEIGHT,
          }}
        >
          <div style={{ position: "relative", width: WIDTH }}>
            {!!videoConstraints ? (
              <div style={{ position: "absolute" }}>
                <Webcam
                  audio={false}
                  width={WIDTH}
                  height={HEIGHT}
                  ref={webcam}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.9}
                  videoConstraints={videoConstraints}
                />
              </div>
            ) : null}
            {!!drawBox ? drawBox : null}
          </div>
        </div>
      </div>
      <Link className="btn btn-primary mt-2 col-5" to="/train">
        Train Face With Camera
      </Link>
    </div>
  );
}
