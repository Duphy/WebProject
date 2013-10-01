{
  "targets": [
    {
      "target_name": "lib",
      "sources": [ "common.cpp","resolv.cpp","create.cpp" ],
      "cflags!":["-fno-exceptions"],
      "cflags!_cc":["-fno-exceptions"],
      "cflag":["-fexceptions"],
      "cflags_cc":["-fexceptions"]
    }
  ]
}