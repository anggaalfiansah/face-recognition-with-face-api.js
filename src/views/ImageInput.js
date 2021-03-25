/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import * as faces from "../api/faces";

export default function ImageInput() {
  const dataFace = useSelector((state) => state.faceReducer.list);
  const [imageURL, setimageURL] = useState(
    process.env.PUBLIC_URL + "/img/mad-dog.jpg"
  );
  const [detections, setdetections] = useState();
  const [faceMatcher, setfaceMatcher] = useState();
  const [match, setmatch] = useState();
  const [Count, setCount] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      await faces.loadModels();
      setfaceMatcher(await faces.createMatcher(dataFace))
      if(!!faceMatcher){
        await handleImage();
      } else {
        setCount(Count+1)
        console.log(Count)
      }
    };
    return fetch();
  }, [Count]);

  const handleImage = async (image = imageURL) => {
    await faces.getFullFaceDescription(image).then(async (fullDesc) => {
      if (!!fullDesc) {
        const desc = fullDesc.map((fd) => fd.descriptor);
        const detect = fullDesc.map((fd) => fd.detection);
        console.log(desc);
        console.log(faceMatcher);
        if (!!desc && !!faceMatcher) {
          setdetections(detect);
          const match = await desc.map((descriptor) =>
            faceMatcher.findBestMatch(descriptor)
          );
          setmatch(match);
          console.log(detect);
          console.log(match);
        }
      }
    })
  };

  const handleFileChange = async (event) => {
    resetState();
    await setimageURL(URL.createObjectURL(event.target.files[0]));
    setCount(Count + 1);
  };

  const resetState = () => {
    setdetections(null);
    setimageURL(null);
  };

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
            {!!match && !!match[i] ? (
              <p
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
                {match[i]._label}
              </p>
            ) : null}
          </div>
        </div>
      );
    });
  }

  return (
    <div className="container-fluid my-5">
      <Link className="btn btn-secondary mx-auto mt-3 col-3" to="/">
        Back
      </Link>
      <div className="row">
        <div className="col-md-6 mx-auto">
          <input
            id="myFileUpload"
            className="form-control mt-2"
            type="file"
            onChange={(e) => handleFileChange(e)}
            accept=".jpg, .jpeg, .png"
          />
          <br />
        </div>
      </div>
      <div className="row">
        <div className="col-md-5 mx-auto">
          <div style={{ position: "absolute" }}>
            <img src={imageURL} alt="imageURL" />
          </div>
          {!!drawBox ? drawBox : null}
        </div>
      </div>
    </div>
  );
}
