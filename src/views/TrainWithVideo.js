/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as faces from "../api/faces";
import Webcam from "react-webcam";
import { Link } from "react-router-dom";

export default function TrainWithVideo() {
  const dataFace = useSelector((state) => state.faceReducer.list);
  const webcam = React.useRef(null);
  const inputSize = 160;
  const [WIDTH, setWIDTH] = useState(720);
  const [HEIGHT] = useState(420);
  const [detections, setdetections] = useState();
  const [facingMode, setfacingmode] = useState("user");
  const [Count, setCount] = useState(0);
  const [ChangeCamera, setChangeCamera] = useState(true);
  const [ListFace, setListFace] = useState([]);
  const [Nama, setNama] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    const fetch = async () => {
      await setInputDevice();
      console.log(ListFace);
    };
    return fetch();
  }, [Count]);

  //   Fungsi Untuk Menentukan Camera
  const setInputDevice = () => {
    navigator.mediaDevices.enumerateDevices().then(async (devices) => {
      let inputDevice = await devices.filter(
        (device) => device.kind === "videoinput"
      );
      if (inputDevice.length < 2) {
        await setfacingmode("user");
      } else {
        setChangeCamera(false);
        setWIDTH(420);
      }
    });
  };

  // Fungsi Untuk Mengcapture gambar dan memprosesnya secara berkala.
  const captured = async () => {
    await faces.loadModels();
    const capture = webcam.current.getScreenshot();
    if (!!capture) {
      faces
        .getFullFaceDescription(capture, inputSize)
        .then(async (fullDesc) => {
          if (!!fullDesc) {
            const desc = fullDesc.map((fd) => fd.descriptor);
            const detect = fullDesc.map((fd) => fd.detection);
            console.log(desc);
            console.log(detect);
            setdetections(detect);
            if (desc.length === 0) {
              alert("Sample Wajah tidak terdeteksi");
            } else {
              const listFace = ListFace;
              listFace.push(desc[0]);
              setListFace(listFace);
              alert("Sample Wajah berhasil ditambahkan");
            }
          }
        })
        .then(() => {
          setCount(Count + 1);
          console.log(Count);
        });
    } else {
      setCount(Count + 1);
      console.log(Count);
    }
  };

  const submit = () => {
    // Silahkan Atur Minimal Jumlah Sample Wajah
    if (ListFace.length < 5) {
      alert("Sample wajah kurang banyak");
    } else {
      const listFace = dataFace;
      const Face = {
        name: Nama,
        descriptors: ListFace,
      };
      listFace.push(Face);
      console.log(listFace);
      dispatch({
        type: "Submit Face",
        value: listFace,
      });
      alert(`Wajah Baru Dengan Nama ${Nama} Berhasil Ditambahkan`);
      setNama("");
      setListFace([]);
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
          />
        </div>
      );
    });
  }

  return (
    <div
      className="Camera"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1>Halaman Train Wajah</h1>
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
                screenshotQuality={0.8}
                videoConstraints={videoConstraints}
              />
            </div>
          ) : null}
          {!!drawBox ? drawBox : null}
        </div>
      </div>
      <div className="row mt-3" hidden={ChangeCamera}>
        <div className="mx-auto">
          <button
            className="btn btn-primary mx-4"
            onClick={() => setfacingmode("user")}
          >
            Front Camera
          </button>
          <button
            className="btn btn-primary mx-4"
            onClick={() => setfacingmode({ exact: "environment" })}
          >
            Back Camera
          </button>
        </div>
      </div>
      <div className="row mt-3 col-6 mx-auto">
        <div className="col-md-6 mx-auto">
          <button className="col-md-12 btn btn-outline-secondary" onClick={captured}>
            Train
          </button>
        </div>
        <div className="col-md-6 mx-auto">
          <button className="col-md-12 btn btn-outline-secondary" onClick={()=>setdetections()}>
            Clear Detection
          </button>
        </div>
      </div>
      <div className="row mt-3 col-6 border px-2 py-2">
        <h5>Daftarkan Wajah</h5>
        <div className="mb-1">Jumlah Sample Wajah : {ListFace.length}</div>
        <input
          type="text"
          className="form-control text-center"
          placeholder="Masukan Nama Wajah"
          value={Nama}
          onChange={(e) => setNama(e.target.value)}
        />
        <button
          className="col-md-5 btn btn-primary mx-auto mt-2"
          onClick={submit}
        >
          Submit
        </button>
        <button
          className="col-md-5 btn btn-danger mx-auto mt-2"
          onClick={() => {
            setListFace([]);
            setdetections();
            alert("Sample Wajah Berhasil Direset");
            setCount(Count + 1);
          }}
        >
          Reset
        </button>
        <hr className="mt-1" />
        <div className="text-center">
          <h5>List Wajah Yang Terdaftar</h5>
          {dataFace.map((face, key) => {
            return (
              <div key={key}>
                {key + 1}. {face.name}
              </div>
            );
          })}
        </div>
      </div>
      <Link className="btn btn-success mx-auto mt-3 col-3" to="/Camera">
        Test Camera
      </Link>
      <Link className="btn btn-secondary mx-auto mt-3 col-3" to="/">
        Back
      </Link>
    </div>
  );
}
