import * as path from 'path'
import * as vscode from 'vscode'
import { GO_TO_SLIDE } from './commands/goToSlide'
import { ISlide } from './ISlide'

export class SlideTreeProvider implements vscode.TreeDataProvider<SlideNode> {
  private readonly _onDidChangeTreeData: vscode.EventEmitter<SlideNode | null> = new vscode.EventEmitter<SlideNode | null>()

  public readonly onDidChangeTreeData: vscode.Event<SlideNode | null> = this
    ._onDidChangeTreeData.event

  constructor(private readonly getSlide: () => ISlide[]) {}

  public update() {
    this._onDidChangeTreeData.fire()
  }

  public register() {
    return vscode.window.registerTreeDataProvider('slidesExplorer', this)
  }

  public getTreeItem(
    element: SlideNode
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element
  }

  public getChildren(element?: SlideNode): vscode.ProviderResult<SlideNode[]> {
    const slides = this.getSlide()
    return new Promise((resolve) => {
      if (element && element.slide.verticalChildren) {
        resolve(
          this.mapSlides(element.slide.verticalChildren, element.slide.index)
        )
      } else {
        resolve(this.mapSlides(slides))
      }
    })
  }

  private mapSlides(slides: ISlide[], parentIndex?: number) {
    return slides.map(
      (s, i) =>
        new SlideNode(
          s,
          parentIndex !== undefined,
          `${s.index} : ${s.title}`,
          s.verticalChildren
            ? vscode.TreeItemCollapsibleState.Collapsed
            : vscode.TreeItemCollapsibleState.None,
          {
            arguments: [
              parentIndex === undefined
                ? { horizontal: s.index, vertical: 0 }
                : { horizontal: parentIndex, vertical: s.index }
            ],
            command: GO_TO_SLIDE,
            title: 'Go to slide'
          }
        )
    )
  }
}

class SlideNode extends vscode.TreeItem {
  get iconName() {
    return this.isVertical ? 'slide-orange.svg' : 'slide-blue.svg'
  }

  public readonly iconPath = {
    light: path.join(__filename, '..', '..', 'resources', this.iconName),
    dark: path.join(__filename, '..', '..', 'resources', this.iconName)
  }

  constructor(
    public readonly slide: ISlide,
    public readonly isVertical: boolean,
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    // console.log(`filename: ${path.join(__filename, '..', 'resources')}, ${path.join(__filename, '..', '..', 'resources')}, ${path.join(__filename, '..', '..', '..', 'resources')}, ${path.join(__filename, '..', '..', '..', '..', 'resources')}`);
    // this.tooltip = `${this.label}-${this.version}`;
    // this.description = this.version;
  }
}
