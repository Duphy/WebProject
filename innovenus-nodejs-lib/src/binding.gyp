{
  "targets": [
    {
      "target_name": "lib",
      "sources": [ "common.cpp","resolv.cpp","create.cpp" ],
      "cflags!":["-fno-exceptions"],
      "cflags!_cc":["-fno-exceptions"],
      "cflags":["-fexceptions"],
      "cflags_cc":["-fexceptions"],
      "conditions": [
        ['OS=="mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
          }
        }]
      ]
    }
  ]
}
