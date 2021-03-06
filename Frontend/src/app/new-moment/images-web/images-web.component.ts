import { Component, OnInit, Input } from '@angular/core';
import { NewMomentService } from '../new-moment.service';

@Component({
  selector: 'fampedia-new-moment-images',
  templateUrl: './images-web.component.html',
  styleUrls: ['./images-web.component.scss']
})
export class ImagesWebComponent implements OnInit {
  @Input() title: boolean = true;
  public images: { data: string, isBase64: boolean }[] = [];
  public takePicture = false;
  private selected: number[] = [];

  constructor(private service: NewMomentService) { }

  ngOnInit() { }

  public addImages(images: string[]) {
    this.images.unshift(...images.map(data => ({ i: 0, data, isBase64: true })));
    this.selected = this.selected.map(n => n + images.length);
    this.takePicture = false;
    this.updateServiceImages();
    this.service.showButton.next(true);
  }

  public select(idx: number) {
    if (this.selected.includes(idx)) {
      this.selected.splice(this.selected.findIndex(n => n === idx), 1);
    } else {
      this.selected.push(idx);
    }
    this.updateServiceImages();
  }

  private updateServiceImages() {
    this.service.images = this.images.filter((img, idx) => !this.selected.includes(idx) && img.isBase64).map(img => img.data) as string[];
  }

  public isSelected(idx: number) {
    return !this.selected.includes(idx);
  }

  public async uploadFile(event: Event) {
    const files = (event.srcElement! as HTMLInputElement).files;
    if (files) {
      const reader = new FileReader();

      for (const file of Array.from(files)) {
        reader.readAsDataURL(file);
        const res = await new Promise<string>((res) => {
          reader.onloadend = () => { res(reader.result as string) };
        });
        this.images.unshift({ data: res, isBase64: true });
        this.updateServiceImages();
      }
      this.selected = this.selected.map(n => n + files.length);
    }
  }

  public imageMode(){
    this.service.showButton.next(false);
    this.takePicture = true;
  }
}
