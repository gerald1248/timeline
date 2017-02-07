package main

import (
	"bytes"
	b64 "encoding/base64"
	"fmt"
	"github.com/elazarl/go-bindata-assetfs"
	"github.com/kabukky/httpscerts"
	"io/ioutil"
	"log"
	"net/http"
)

type PostStruct struct {
	Buffer string
}

func serve(certificate, key, hostname string, port int) {
	virtual_fs := &assetfs.AssetFS{
		Asset:     Asset,
		AssetDir:  AssetDir,
		AssetInfo: AssetInfo}

	err := httpscerts.Check(certificate, key)
	if err != nil {
		err = httpscerts.Generate(certificate, key, fmt.Sprintf("%s:%d", hostname, port))
		if err != nil {
			log.Fatal("Error: Couldn't create https certs.")
		}
		fmt.Printf("Created %s and %s\n", certificate, key)
	}

	http.Handle("/static/", http.FileServer(virtual_fs))
	http.HandleFunc("/timeline/compose", guiHandler)
	http.HandleFunc("/timeline", handler)

	fmt.Printf("Listening on port %d\n"+
		"POST JSON sources to http://%s:%d/timeline\n"+
		"Compose timelines at http://%s:%d/timeline/compose\n", port, hostname, port, hostname, port)
	log.Fatal(http.ListenAndServeTLS(fmt.Sprintf("%s:%d", hostname, port), certificate, key, nil))
}

func guiHandler(w http.ResponseWriter, r *http.Request) {
	bytes, _ := Asset("static/index.html")
	fmt.Fprintf(w, "%s\n", string(bytes))
}

func handler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		handlePost(&w, r)
	case "GET":
		handleGet(&w, r)
	}
}

func handleGet(w *http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(*w, "GET request\nRequest struct = %v\n", r)
}

func handlePost(w *http.ResponseWriter, r *http.Request) {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Fprintf(*w, "Can't read POST request body: %s\n", err)
		return
	}

	result := processBytes(body)

	if result.Code > 0 {
		fmt.Fprintf(*w, "<p>%s</p>", result.Message)
		return
	}

	//now display using base64 data
	buf := new(bytes.Buffer)
	err = result.Context.EncodePNG(buf)
	if err != nil {
		fmt.Fprintf(*w, "<p>Can't encode resulting image: %v</p>", err)
		return
	}

	//TBD: option to return bytestream
	s := b64.StdEncoding.EncodeToString(buf.Bytes())
	fmt.Fprintf(*w, "<img class=\"img-responsive\" alt=\"Timeline\" src=\"data:image/png;base64,%s\"/>", s)
}
