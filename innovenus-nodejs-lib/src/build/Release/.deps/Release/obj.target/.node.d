cmd_Release/obj.target/.node := flock ./Release/linker.lock g++ -shared -pthread -rdynamic -m64  -Wl,-soname=.node -o Release/obj.target/.node -Wl,--start-group Release/obj.target/lib/common.o Release/obj.target/lib/resolv.o Release/obj.target/lib/create.o -Wl,--end-group 
