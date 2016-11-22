package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"sync"
)

type PostStruct struct {
	Buffer string
}

func serve(port int) {
	http.HandleFunc("/timeline", handler)
	fmt.Printf("Listening on port %d\n", port)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", port), nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		handlePost(&w, r)
	case "GET":
		handleGet(&w, r)
	}
	//ignore other methods
}

func handleGet(w *http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(*w, "GET request\nRequest struct = %s\n", r)	
}

func handlePost(w *http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintf(*w, "Can't read POST request body: %s\n", err)
		return
	}

	//write to tmpfile
	tmpfile, err := ioutil.TempFile("", "timeline") //use const filePrefix?
	if (err != nil) {
		log.Fatal(err)
	}

	defer os.Remove(tmpfile.Name())

	if _, err := tmpfile.Write(body); err != nil {
		log.Fatal(err)
	}

	if err := tmpfile.Close(); err != nil {
		log.Fatal(err)
	}

	//process the file
	var mu sync.Mutex
	ch := make(chan Result)
	go processFile(tmpfile.Name(), ch)
	mu.Lock()
	result := <-ch
	mu.Unlock()
	fmt.Println(result.Message)
}