all: src/build/Release/lib.node
	cp src/build/Release/lib.node ../innovenus-nodejs/service/
src/build/Release/lib.node: src/binding.gyp src/common.cpp src/create.cpp src/resolv.cpp
	cd src;\
	node-gyp configure --python D:/Python27/python.exe;\
	node-gyp build;\